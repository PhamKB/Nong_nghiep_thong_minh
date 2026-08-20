using System;

namespace QuanLyVatTuNongNghiep.Domain.Entities
{
    /// <summary>
    /// Representing the 'KhachHang' table in the database.
    /// Maps to the customer who buys fertilizers and pesticides.
    /// </summary>
    public class Customer
    {
        public int Id { get; set; }
        public string FullName { get; set; } = null!; // HoTen
        public string? PhoneNumber { get; set; } // DienThoai
        public string? Address { get; set; } // DiaChi
        public int HamletId { get; set; } // XomId
        public DateTime? DateOfBirth { get; set; } // NgaySinh
        public string Occupation { get; set; } = "Farmer"; // NgheNghiep
        public decimal? FarmingArea { get; set; } // DienTichCanhTac (in sào)
        public int? PrimaryCropId { get; set; } // LoaiCayTrongId
        public string? Note { get; set; } // GhiChu

        // Navigation properties
        public virtual Hamlet Hamlet { get; set; } = null!;
        public virtual Crop? PrimaryCrop { get; set; }
        public virtual CustomerDebt? Debt { get; set; }
    }
}
