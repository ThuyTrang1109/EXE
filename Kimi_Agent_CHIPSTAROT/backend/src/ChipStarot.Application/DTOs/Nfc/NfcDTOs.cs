namespace ChipStarot.Application.DTOs.Nfc;

public record ScanNfcRequest(
    string NfcTagId,
    Guid AccountId
);

public record NfcActivationResult(
    bool IsSuccess,
    string Message,
    int CreditsGranted,
    string NfcTagId,
    string Status
);

public record NfcChipDto(
    string NfcTagId,
    int? ProductId,
    string? ProductName,
    Guid? AccountId,
    string? AccountEmail,
    string Status,
    int CreditsGranted,
    int ScanCount,
    DateTime? LastScannedAt,
    DateTime? ActivatedAt
);

public record GenerateNfcRequest(string NfcTagId, int ProductId);

public record BulkGenerateNfcRequest(int ProductId, int Quantity);
