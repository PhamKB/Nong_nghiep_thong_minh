using System;
using System.Collections.Generic;

namespace QuanLyVatTuNongNghiep.Domain.Entities
{
    /// <summary>
    /// Representing the 'HangHoa' table in the database.
    /// Following the Microsoft naming conventions on C# while mapping to the Vietnamese database schema.
    /// </summary>
    public class Product
    {
        public Product()
        {
            ProductUses = new HashSet<ProductUse>();
            ProductCrops = new HashSet<ProductCrop>();
            ProductPests = new HashSet<ProductPest>();
            Images = new HashSet<ProductImage>();
            PriceLogs = new HashSet<PriceLog>();
        }

        public int Id { get; set; }
        public string ProductCode { get; set; } = null!; // MaHangHoa
        public int CategoryId { get; set; } // NhomHangId
        public int UnitId { get; set; } // DonViTinhId
        public int ManufacturerId { get; set; } // NhaSanXuatId
        
        public string LabelName { get; set; } = null!; // TenTrenBaoBi
        public string CommonName { get; set; } = null!; // TenThuongGoi
        public string? ActiveIngredient { get; set; } // HoatChat
        public string? Concentration { get; set; } // HamLuong
        public string? Specification { get; set; } // QuyCach
        public string? Dosage { get; set; } // LieuLuong
        public int PreHarvestInterval { get; set; } = 7; // ThoiGianCachLy
        
        public decimal CurrentImportPrice { get; set; } // GiaNhapHienTai
        public decimal CurrentSellingPrice { get; set; } // GiaBanHienTai
        public string? InternalQrCode { get; set; } // QrNoiBo

        // Navigation properties
        public virtual Category Category { get; set; } = null!;
        public virtual Unit Unit { get; set; } = null!;
        public virtual Manufacturer Manufacturer { get; set; } = null!;
        public virtual Inventory? Inventory { get; set; }

        public virtual ICollection<ProductUse> ProductUses { get; set; }
        public virtual ICollection<ProductCrop> ProductCrops { get; set; }
        public virtual ICollection<ProductPest> ProductPests { get; set; }
        public virtual ICollection<ProductImage> Images { get; set; }
        public virtual ICollection<PriceLog> PriceLogs { get; set; }
    }
}
