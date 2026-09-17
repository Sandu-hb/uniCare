using UniCare.Application.Features.Medicines.Dtos;

namespace UniCare.Application.Features.Medicines;

/// <summary>
/// Read-only catalogue lookup, not inventory management — a doctor picking a
/// medicine to prescribe, nothing about stock or batches (see Medicine/
/// MedicineBatch, which model that but have no service yet).
/// </summary>
public interface IMedicineService
{
    Task<IReadOnlyList<MedicineDto>> SearchAsync(
        string? search, CancellationToken cancellationToken = default);
}
