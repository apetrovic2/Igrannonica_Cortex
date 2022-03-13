﻿// <auto-generated />
using Igrannonica.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Igrannonica.Migrations
{
    [DbContext(typeof(UserContext))]
    partial class UserContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.2")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("Igrannonica.Models.User", b =>
                {
                    b.Property<int>("id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("email")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("firstname")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("lastname")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("passwordHash")
                        .IsRequired()
                        .HasColumnType("nvarchar(500)");

                    b.Property<string>("passwordSalt")
                        .IsRequired()
                        .HasColumnType("nvarchar(500)");

                    b.Property<string>("username")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)");

                    b.HasKey("id");

                    b.HasIndex("email")
                        .IsUnique();

                    b.HasIndex("username")
                        .IsUnique();

                    b.ToTable("User");
                });
#pragma warning restore 612, 618
        }
    }
}
