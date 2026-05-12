using ChipStarot.Application.Services;
using ChipStarot.Domain.Entities;
using ChipStarot.Domain.Interfaces;
using ChipStarot.WebAPI.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChipStarot.WebAPI.Controllers;

[Route("api/blogs")]
public class BlogsController : BaseApiController
{
    private readonly IBlogRepository _blogRepo;

    public BlogsController(IBlogRepository blogRepo) => _blogRepo = blogRepo;

    /// <summary>Danh sách bài viết (public)</summary>
    [HttpGet]
    public async Task<IActionResult> GetBlogs([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var (total, items) = await _blogRepo.GetPagedAsync(page, pageSize, "published");
        return Ok(new { success = true, data = items, total, page, pageSize });
    }

    /// <summary>Chi tiết bài viết qua slug</summary>
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var post = await _blogRepo.GetBySlugAsync(slug);
        if (post == null) return NotFound();
        
        post.ViewCount++;
        await _blogRepo.UpdateAsync(post);
        
        return Ok(new { success = true, data = post });
    }

    // ─── ADMIN endpoints ───

    /// <summary>[Admin] Danh sách tất cả bài viết</summary>
    [HttpGet("admin")]
    [HasPermission("content.manage")]
    public async Task<IActionResult> GetAllAdmin([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var (total, items) = await _blogRepo.GetPagedAsync(page, pageSize, null);
        return Ok(new { success = true, data = items, total, page, pageSize });
    }

    /// <summary>[Admin] Tạo bài viết mới</summary>
    [HttpPost]
    [HasPermission("content.manage")]
    public async Task<IActionResult> Create([FromBody] CreateBlogPostRequest request)
    {
        var post = new BlogPost
        {
            Title = request.Title,
            Slug = request.Slug.ToLowerInvariant(),
            Content = request.Content,
            Summary = request.Summary,
            ThumbnailUrl = request.ThumbnailUrl,
            Tags = request.Tags,
            Status = request.Status,
            AdminId = CurrentUserId
        };
        await _blogRepo.AddAsync(post);
        return StatusCode(201, new { success = true, data = post });
    }

    /// <summary>[Admin] Cập nhật bài viết</summary>
    [HttpPut("{id:int}")]
    [HasPermission("content.manage")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBlogPostRequest request)
    {
        var post = await _blogRepo.GetByIdAsync(id);
        if (post == null) return NotFound();

        if (request.Title != null) post.Title = request.Title;
        if (request.Slug != null) post.Slug = request.Slug.ToLowerInvariant();
        if (request.Content != null) post.Content = request.Content;
        if (request.Summary != null) post.Summary = request.Summary;
        if (request.ThumbnailUrl != null) post.ThumbnailUrl = request.ThumbnailUrl;
        if (request.Tags != null) post.Tags = request.Tags;
        if (request.Status != null) post.Status = request.Status;
        post.UpdatedAt = DateTime.UtcNow;

        await _blogRepo.UpdateAsync(post);
        return Ok(new { success = true, message = "Cập nhật thành công." });
    }

    /// <summary>[Admin] Xoá bài viết</summary>
    [HttpDelete("{id:int}")]
    [HasPermission("content.manage")]
    public async Task<IActionResult> Delete(int id)
    {
        await _blogRepo.DeleteAsync(id);
        return Ok(new { success = true, message = "Đã xoá bài viết." });
    }
}

public record CreateBlogPostRequest(
    string Title, string Slug, string Content, string? Summary, 
    string? ThumbnailUrl, string? Tags, string Status = "draft");

public record UpdateBlogPostRequest(
    string? Title, string? Slug, string? Content, string? Summary, 
    string? ThumbnailUrl, string? Tags, string? Status);
