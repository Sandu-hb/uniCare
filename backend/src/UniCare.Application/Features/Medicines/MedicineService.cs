using Microsoft.EntityFrameworkCore;
using UniCare.Application.Abstractions;
using UniCare.Application.Features.Medicines.Dtos;

namespace UniCare.Application.Features.Medicines;

public class MedicineService(IApplicationDbContext db) : IMedicineService
{
    public async Task<IReadOnlyList<MedicineDto>> SearchAsync(
        string? search, CancellationToken cancellationToken = default)
    {
        var query = db.Medicines.AsNoTracking().Where(m => m.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(m => m.Name.ToLower().Contains(term));
        }

        return await query
            .OrderBy(m => m.Name)
            .Take(20)
            .Select(m => new MedicineDto
            {
                Id = m.Id,
                Name = m.Name,
                GenericName = m.GenericName,
                Form = m.Form,
                Strength = m.Strength,
                Unit = m.Unit,
            })
            .ToListAsync(cancellationToken);
    }
}
