using Microsoft.EntityFrameworkCore;
using QuanLyVatTuNongNghiep.Domain.Entities;

namespace QuanLyVatTuNongNghiep.Infrastructure.Persistence
{
    /// <summary>
    /// Entity Framework Core DbContext configurations.
    /// Standard Clean Architecture DbContext class mapping English class names to Vietnamese database tables.
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<Customer> Customers { get; set; } = null!;
        public DbSet<Hamlet> Hamlets { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Customer Mapping
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.ToTable("KhachHang");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FullName).HasColumnName("HoTen").IsRequired().HasMaxLength(150);
                entity.Property(e => e.PhoneNumber).HasColumnName("DienThoai").HasMaxLength(20);
                entity.Property(e => e.Address).HasColumnName("DiaChi").HasMaxLength(255);
                entity.Property(e => e.HamletId).HasColumnName("XomId");
                entity.Property(e => e.DateOfBirth).HasColumnName("NgaySinh");
                entity.Property(e => e.Occupation).HasColumnName("NgheNghiep").HasMaxLength(100);
                entity.Property(e => e.FarmingArea).HasColumnName("DienTichCanhTac").HasColumnType("decimal(10,2)");
                entity.Property(e => e.PrimaryCropId).HasColumnName("LoaiCayTrongId");
                entity.Property(e => e.Note).HasColumnName("GhiChu").HasMaxLength(255);

                entity.HasOne(d => d.Hamlet)
                    .WithMany()
                    .HasForeignKey(d => d.HamletId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Product Mapping
            modelBuilder.Entity<Product>(entity =>
            {
                entity.ToTable("HangHoa");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ProductCode).HasColumnName("MaHangHoa").IsRequired().HasMaxLength(20);
                entity.Property(e => e.CategoryId).HasColumnName("NhomHangId");
                entity.Property(e => e.UnitId).HasColumnName("DonViTinhId");
                entity.Property(e => e.ManufacturerId).HasColumnName("NhaSanXuatId");
                entity.Property(e => e.LabelName).HasColumnName("TenTrenBaoBi").IsRequired().HasMaxLength(200);
                entity.Property(e => e.CommonName).HasColumnName("TenThuongGoi").IsRequired().HasMaxLength(200);
                entity.Property(e => e.ActiveIngredient).HasColumnName("HoatChat").HasMaxLength(150);
                entity.Property(e => e.Concentration).HasColumnName("HamLuong").HasMaxLength(100);
                entity.Property(e => e.Specification).HasColumnName("QuyCach").HasMaxLength(100);
                entity.Property(e => e.Dosage).HasColumnName("LieuLuong").HasMaxLength(255);
                entity.Property(e => e.PreHarvestInterval).HasColumnName("ThoiGianCachLy").HasDefaultValue(7);
                entity.Property(e => e.CurrentImportPrice).HasColumnName("GiaNhapHienTai").HasColumnType("decimal(18,2)");
                entity.Property(e => e.CurrentSellingPrice).HasColumnName("GiaBanHienTai").HasColumnType("decimal(18,2)");
                entity.Property(e => e.InternalQrCode).HasColumnName("QrNoiBo").HasMaxLength(255);
            });
        }
    }
}
