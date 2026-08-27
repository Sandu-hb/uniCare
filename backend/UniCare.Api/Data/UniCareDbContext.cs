using Microsoft.EntityFrameworkCore;

namespace UniCare.Api.Data;

public class UniCareDbContext : DbContext
{
    public UniCareDbContext(
        DbContextOptions<UniCareDbContext> options)
        : base(options)
    {
    }
}