# Panduan Alur Kerja (Userflow) & Logika Integrasi Mufid Musyawarah Fiqhiyyah

Dokumen ini menjelaskan rancangan interaksi sistem, alur kerja (userflow), integrasi logika antara tiga aktor utama keagamaan (**Mubahhisin, Muharrir, Mushohih**), serta batasan operasional untuk peran **Admin** di dalam aplikasi **Mufid (Musyawarah Fiqhiyyah Digital)**.

---

## 1. Peran Aktor & Tanggung Jawab Utama

Aplikasi Mufid dirancang mengikuti struktur sidang komisi Bahtsul Masail tradisional, dengan pembagian peran yang ketat untuk menjaga kualitas hukum (Fiqh) yang dihasilkan:

| Peran | Deskripsi Tradisional | Tanggung Jawab Digital |
| :--- | :--- | :--- |
| **Mubahhisin** | Delegasi / Utusan Pesantren | Menyusun draf jawaban komprehensif, menyematkan teks kitab kuning (Arab berharakat), dan melampirkan terjemahan. |
| **Muharrir** | Tim Perumus / Moderator Sidang | Memantau draf delegasi, memberikan catatan pelurusan (evaluasi), menandai referensi utama, menulis formulasi draf keputusan akhir (*Natijah*), serta menginput jawaban langsung jika diperlukan. |
| **Mushohih** | Dewan Hakim / Penyelia Syariah | Memeriksa validitas seluruh jawaban, mengedit draf atau teks Arab secara langsung demi akurasi teks syar'i, merevisi formulasi draf, dan melakukan pengesahan akhir (*Ketuk Palu*). |
| **Admin** | Administrator Platform | Mengelola data pengguna, menginput masalah baru (*Waqi'iyyah* & *As'ilah*), mengunggah dokumen referensi (PDF), serta memantau log aktivitas forensik (*Audit Log*). |

---

## 2. Alur Kerja Terintegrasi & Logika Sistem

Berikut adalah fase integrasi data sejak masalah dilempar ke forum hingga keputusan hukum disahkan secara mutlak:

```
[Admin] Menginput Masalah Baru
       │
       ▼
[Mubahhisin] Menyusun draf jawaban & kutipan kitab (Status: Draft)
       │
       ├─► [Muharrir] Memantau & Memberi Catatan Pelurusan (Status: Revisi)
       │
       ▼
[Mubahhisin] Mengirimkan Jawaban Final Kelompok (Status: Disetor)
       │
       ├─► [Muharrir] Menentukan Referensi Utama & Merumuskan "Natijah"
       │
       ▼
[Mushohih] Pentashihan: Edit Teks/Citations & Koreksi Natijah
       │
       ▼
[Mushohih] Melakukan "Ketuk Palu" (Status Masalah: Disahkan) ──► Terkunci Mutlak
```

### Fase 1: Inisiasi Masalah
- **Aktor**: Admin.
- **Proses**: Admin merumuskan deskripsi kasus nyata (*Waqi'iyyah*) dan pertanyaan fikih formal (*As'ilah*) melalui menu **Manajemen Soal**. Masalah yang baru dibuat otomatis berstatus `Draft` dan siap dibahas oleh seluruh delegasi.

### Fase 2: Perumusan Jawaban & Kutipan Kitab
- **Aktor**: Mubahhisin.
- **Proses**: 
  1. Delegasi login menggunakan akun kelompok masing-masing (misal: *Utusan Ploso*, *Utusan Lirboyo*, dll).
  2. Mubahhisin menulis teks argumentasi hukum pada kolom **Lembar Kerja Jawaban Delegasi**.
  3. Mubahhisin menginput kutipan (*Arabic Citation*) yang mencakup: nama kitab, teks Arab berharakat, dan terjemahan bahasa Indonesia.
  4. Mubahhisin dapat menyimpan draf secara berkala (status jawaban: `Draft`). Setelah yakin, mereka menekan **"Setor ke Perumus"** (status jawaban berubah menjadi `Disetor`).
- **Logika Kunci**: Begitu berstatus `Disetor`, lembar kerja kelompok tersebut otomatis **terkunci** bagi Mubahhisin guna mencegah perubahan saat sedang diperiksa oleh Perumus.

### Fase 3: Monitoring & Sinkronisasi Jawaban (Interaksi Mubahhisin ◄► Muharrir)
- **Aktor**: Muharrir.
- **Proses**:
  - Melalui tab **Monitoring Delegasi**, Muharrir melihat seluruh jawaban kelompok yang masuk secara *real-time*.
  - **Catatan Pelurusan (Evaluation Note)**: Jika argumen suatu kelompok dianggap melenceng, Muharrir dapat menulis catatan instruksi khusus dan menekan **"Kembalikan ke Revisi"**. Hal ini akan mengubah status jawaban kelompok tersebut menjadi `Revisi` dan otomatis membuka kembali akses edit untuk Mubahhisin kelompok terkait.
  - **Referensi Utama**: Muharrir dapat menandai satu atau lebih jawaban delegasi yang memiliki dasar dalil paling kuat sebagai acuan utama sidang dengan menekan ikon bintang (*Primary Reference*).

### Detail Khusus: Muharrir Bisa Mengirimkan/Menulis Jawaban
- **Aktor**: Muharrir.
- **Proses**:
  - Untuk memfasilitasi kelancaran sidang, Muharrir dilengkapi dengan tab khusus **Kirim Jawaban** di dalam panelnya.
  - **Fungsi**: Muharrir dapat menulis jawaban komprehensif lengkap dengan kutipan kitab Arab dan terjemahan atas nama komisi perumus sendiri atau untuk membantu kelompok delegasi yang mengalami kendala teknis dalam penginputan dalil.
  - Jawaban ini akan langsung masuk ke dalam ekosistem pembahasan sebagai bagian dari khazanah dalil masalah tersebut, yang nantinya dapat dipilih sebagai referensi utama atau diramu ke dalam kesimpulan akhir.

### Fase 4: Formulasi Natijah (Kesimpulan Sementara)
- **Aktor**: Muharrir.
- **Proses**:
  - Setelah semua jawaban delegasi dirasa cukup dan disetor, Muharrir beralih ke tab **Natijah Perumus**.
  - Di sini, Muharrir merangkum intisari argumen dari jawaban-jawaban yang berstatus referensi utama menjadi sebuah formulasi keputusan utuh (*Natijah*).
  - Muharrir kemudian mengklik **"Setor Natijah"** untuk mengirimkan kesimpulan sementara ini ke hadapan Dewan Mushohih.

### Fase 5: Pentashihan Akhir & Ketuk Palu (Interaksi Muharrir ◄► Mushohih)
- **Aktor**: Mushohih (Kiai/Dewan Hakim Agung).
- **Proses**:
  - Mushohih memegang otoritas yurisdiksi tertinggi. Di dalam **Panel Mushohih**, mereka dapat:
    1. **Edit Jawaban Delegasi**: Mengedit langsung teks argumentasi kelompok jika ada redaksi yang kurang tepat.
    2. **Edit & Manajemen Dalil**: Memodifikasi teks Arab, mengganti terjemahan, menghapus kutipan yang lemah, atau bahkan menginput dalil darurat baru (*Emergency Citation*) pada kelompok manapun.
    3. **Koreksi Natijah**: Mengedit secara bebas draf kesimpulan (*Natijah*) yang sebelumnya telah dirumuskan oleh Muharrir untuk disempurnakan.
  - **Ketuk Palu**: Setelah draf keputusan akhir dirasa sempurna, Mushohih mengklik **"Ketuk Palu Pengesahan"**.
- **Logika Kunci**: Setelah palu diketuk, status masalah berubah secara permanen menjadi `Disahkan`. **Seluruh sistem untuk masalah tersebut dikunci secara mutlak**. Baik Mubahhisin maupun Muharrir tidak dapat lagi mengubah jawaban, dalil, maupun kesimpulan hukum. Dokumen keputusan resmi kini siap diunduh dalam format PDF/Cetak melalui menu **Arsip Digital**.

---

## 3. Alur Kerja & Batasan User Admin

Meskipun memegang kendali teknis atas platform, peran **Admin** memiliki batasan operasional yang ketat demi menjaga kemurnian keputusan keagamaan:

### A. Kewenangan Administratif Admin
1. **Manajemen Pengguna**: Membuat, memodifikasi, menetapkan kelompok utusan, serta menghapus akun pengguna (Mubahhisin, Muharrir, Mushohih).
2. **Manajemen Soal**: Menginput masalah (*Waqi'iyyah*) dan pertanyaan (*As'ilah*) sebelum sidang dimulai. Admin juga dapat menghapus soal jika terjadi pembatalan sidang komisi.
3. **Manajemen Dokumen**: Mengunggah berkas PDF (scan kitab rujukan atau surat keputusan) sebagai dokumen lampiran digital.
4. **Forensik Sistem**: Memantau aktivitas melalui **Audit Log** untuk memastikan integritas data (melacak siapa, kapan, dan apa yang diubah di dalam sistem).

### B. Batasan Ketat Peran Admin (Limitations)
1. **Tidak Memiliki Otoritas Teologis**:
   - Admin **tidak diperkenankan** untuk mengedit teks keputusan keagamaan (*Natijah*) atau mengubah status validasi draf jawaban di bawah kondisi normal.
   - Admin tidak memiliki tombol "Ketuk Palu" bawaan dalam panel manajemen soal standar untuk mengesahkan suatu masalah fikih. Pengesahan tetap sah hanya jika diketuk oleh dewan Mushohih melalui instrumen syar'i mereka.
2. **Penguncian Otomatis (Lock Restrictions)**:
   - Apabila suatu masalah telah berstatus `Disahkan` oleh Mushohih, Admin secara default juga **terkunci** dari mengedit deskripsi soal, Waqi'iyyah, maupun daftar dalil guna menjaga orisinalitas dokumen berita acara yang telah disahkan.

### C. Katup Penyelamat: Sakelar Override Admin (Admin Override Switch)
Aplikasi Mufid dilengkapi dengan mekanisme khusus berupa **Admin Override Mode** (Sakelar Override):
- **Tujuan**: Digunakan jika terjadi kesalahan fatal di tengah persidangan (seperti kesalahan ketuk palu sebelum waktunya oleh Mushohih, atau kesalahan sistemik lainnya).
- **Mekanisme**: Ketika sakelar ini diaktifkan di dashboard Admin:
  - Pembatasan penguncian status `Disahkan` ditangguhkan untuk sementara waktu.
  - Admin mendapatkan otorisasi darurat untuk membuka kembali masalah yang terkunci, mengembalikan status ke `Draft`, atau melakukan penyesuaian darurat.
  - **Transparansi Sistem**: Setiap aktivasi mode override ini serta perubahan yang dilakukan di dalamnya akan langsung dicatat secara otomatis ke dalam **Audit Log** dengan label merah `OVERRIDE` yang tidak dapat dihapus oleh siapapun, demi menjaga akuntabilitas sidang.
