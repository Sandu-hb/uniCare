using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Medicines.Dtos;

public record MedicineDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? GenericName { get; init; }
    public required MedicineForm Form { get; init; }
    public string? Strength { get; init; }
    public required string Unit { get; init; }
}
