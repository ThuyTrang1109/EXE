using ChipStarot.Application.DTOs.Products;
using ChipStarot.Application.Services;
using ChipStarot.Domain.Interfaces;
using ChipStarot.WebAPI.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChipStarot.WebAPI.Controllers;

/// <summary>Products, categories, and reviews</summary>
[Route("api/products")]
public class ProductsController : BaseApiController
{
    private readonly IProductRepository _productRepo;

    public ProductsController(IProductRepository productRepo) => _productRepo = productRepo;

    /// <summary>Danh sách sản phẩm (phân trang, lọc)</summary>
    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] int? categoryId = null,
        [FromQuery] string? search = null)
    {
        var (total, items) = await _productRepo.GetPagedAsync(page, pageSize, categoryId, search);
        var dtos = items.Select(p => new ProductDto(
            p.Id, p.Name, p.Category?.Name, p.GemstoneType, p.Description,
            p.BasePrice, p.OldPrice, p.ImageUrl, p.StockQuantity,
            p.IsFeatured, p.TagText, p.TagColor, p.AverageRating, p.ReviewCount,
            p.NfcCreditsBonus, p.IsActive));
        return Ok(new { success = true, data = dtos, total, page, pageSize });
    }

    /// <summary>Sản phẩm nổi bật cho trang chủ</summary>
    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured()
    {
        var items = await _productRepo.GetFeaturedAsync();
        var dtos = items.Select(p => new ProductDto(
            p.Id, p.Name, p.Category?.Name, p.GemstoneType, p.Description,
            p.BasePrice, p.OldPrice, p.ImageUrl, p.StockQuantity,
            p.IsFeatured, p.TagText, p.TagColor, p.AverageRating, p.ReviewCount,
            p.NfcCreditsBonus, p.IsActive));
        return Ok(new { success = true, data = dtos });
    }

    /// <summary>Chi tiết sản phẩm kèm đánh giá</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var p = await _productRepo.GetByIdAsync(id);
        if (p == null) return NotFound(new { error = "Sản phẩm không tồn tại." });

        var reviews = await _productRepo.GetReviewsByProductAsync(id);
        var dto = new ProductDetailDto(
            p.Id, p.Name, p.CategoryId, p.Category?.Name, p.GemstoneType, p.Description,
            p.BasePrice, p.OldPrice, p.ImageUrl, p.StockQuantity, p.IsFeatured, p.TagText,
            p.AverageRating, p.ReviewCount, p.NfcCreditsBonus, p.IsActive,
            reviews.Take(10).Select(r => new ReviewDto(
                r.Id, r.Account?.CustomerProfile?.FullName ?? "Ẩn danh",
                r.Rating, r.Comment, r.CreatedAt)));

        return Ok(new { success = true, data = dto });
    }

    /// <summary>Danh mục sản phẩm</summary>
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var cats = await _productRepo.GetCategoriesAsync();
        var dtos = cats.Select(c => new CategoryDto(c.Id, c.Name, c.Description, c.IconUrl, c.IsActive));
        return Ok(new { success = true, data = dtos });
    }

    /// <summary>Thêm đánh giá sản phẩm</summary>
    [HttpPost("{id:int}/reviews")]
    [Authorize]
    public async Task<IActionResult> AddReview(int id, [FromBody] AddReviewRequest request)
    {
        if (request.Rating < 1 || request.Rating > 5)
            return BadRequest(new { error = "Đánh giá phải từ 1 đến 5 sao." });

        var product = await _productRepo.GetByIdAsync(id);
        if (product == null) return NotFound(new { error = "Sản phẩm không tồn tại." });

        var review = new Domain.Entities.ProductReview
        {
            ProductId = id,
            AccountId = CurrentUserId,
            Rating = request.Rating,
            Comment = request.Comment
        };
        await _productRepo.AddReviewAsync(review);

        // Cập nhật cache rating
        var allReviews = await _productRepo.GetReviewsByProductAsync(id);
        var avgRating = (decimal)allReviews.Average(r => r.Rating);
        await _productRepo.UpdateRatingCacheAsync(id, Math.Round(avgRating, 1), allReviews.Count());

        return Ok(new { success = true, message = "Đánh giá đã được ghi nhận." });
    }

    // ─── ADMIN endpoints ───

    /// <summary>[Admin] Tạo sản phẩm mới</summary>
    [HttpPost]
    [HasPermission("products.manage")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        var product = new Domain.Entities.Product
        {
            Name = request.Name,
            CategoryId = request.CategoryId,
            GemstoneType = request.GemstoneType,
            Description = request.Description,
            BasePrice = request.BasePrice,
            OldPrice = request.OldPrice,
            ImageUrl = request.ImageUrl,
            StockQuantity = request.StockQuantity,
            IsFeatured = request.IsFeatured,
            TagText = request.TagText,
            TagColor = request.TagColor,
            NfcCreditsBonus = request.NfcCreditsBonus
        };
        await _productRepo.AddAsync(product);
        return StatusCode(201, new { success = true, data = new { product.Id } });
    }

    /// <summary>[Admin] Cập nhật sản phẩm</summary>
    [HttpPut("{id:int}")]
    [HasPermission("products.manage")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
    {
        var product = await _productRepo.GetByIdAsync(id);
        if (product == null) return NotFound(new { error = "Sản phẩm không tồn tại." });

        if (request.Name != null) product.Name = request.Name;
        if (request.CategoryId.HasValue) product.CategoryId = request.CategoryId;
        if (request.Description != null) product.Description = request.Description;
        if (request.BasePrice.HasValue) product.BasePrice = request.BasePrice.Value;
        if (request.OldPrice.HasValue) product.OldPrice = request.OldPrice;
        if (request.ImageUrl != null) product.ImageUrl = request.ImageUrl;
        if (request.StockQuantity.HasValue) product.StockQuantity = request.StockQuantity.Value;
        if (request.IsFeatured.HasValue) product.IsFeatured = request.IsFeatured.Value;
        if (request.TagText != null) product.TagText = request.TagText;
        if (request.TagColor != null) product.TagColor = request.TagColor;
        if (request.NfcCreditsBonus.HasValue) product.NfcCreditsBonus = request.NfcCreditsBonus.Value;
        if (request.IsActive.HasValue) product.IsActive = request.IsActive.Value;

        await _productRepo.UpdateAsync(product);
        return Ok(new { success = true, message = "Cập nhật thành công." });
    }

    /// <summary>[Admin] Xóa mềm sản phẩm</summary>
    [HttpDelete("{id:int}")]
    [HasPermission("products.manage")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        await _productRepo.DeleteAsync(id);
        return Ok(new { success = true, message = "Sản phẩm đã được ẩn." });
    }
}
