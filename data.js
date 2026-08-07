window.MPK_DATA = {
  activities: [
    "Baseline/Diagnostik",
    "Latihan Mingguan",
    "Evaluasi Agustus",
    "Evaluasi September",
    "Evaluasi Oktober",
    "Evaluasi November",
    "Pra-Uji Akhir",
    "Ujian Akhir"
  ],
  scoreGuide: {
    1: "Tidak mampu meskipun sudah diarahkan.",
    2: "Mengenal tugas, tetapi hampir seluruh pelaksanaan masih salah.",
    3: "Mampu sebagian kecil dengan bimbingan intensif.",
    4: "Mulai mampu, tetapi kesalahan masih banyak dan perlu pendampingan.",
    5: "Mampu sekitar setengah tuntutan tugas dengan bimbingan.",
    6: "Mampu sebagian besar tugas, tetapi masih membutuhkan koreksi.",
    7: "Kompeten: mampu melaksanakan dengan benar dengan koreksi kecil.",
    8: "Mampu secara mandiri dan konsisten.",
    9: "Sangat menguasai, hampir tanpa kesalahan.",
    10: "Unggul, konsisten, dapat menjadi contoh atau membimbing peserta lain."
  },
  categories: {
    pbb: {
      label: "PBB",
      icon: "🫡",
      indicators: [
        {key:"posture", label:"Sikap dan Postur", weight:20, hint:"Ketegapan, posisi tubuh, sikap dasar."},
        {key:"movement", label:"Ketepatan Gerakan", weight:30, hint:"Kesesuaian gerakan dengan ketentuan PBB."},
        {key:"command", label:"Respons terhadap Aba-aba", weight:20, hint:"Kecepatan dan ketepatan merespons aba-aba."},
        {key:"consistency", label:"Konsistensi Gerakan", weight:15, hint:"Kemampuan mempertahankan kualitas gerakan."},
        {key:"cohesion", label:"Kekompakan", weight:15, hint:"Keselarasan gerakan dengan kelompok."}
      ]
    },
    discipline: {
      label: "Disiplin Waktu",
      icon: "⏱️",
      special: "attendance",
      statuses: [
        {key:"early", label:"Hadir sebelum waktu kegiatan", score:10},
        {key:"ontime", label:"Tepat waktu", score:10},
        {key:"late2", label:"Terlambat ≤ 2 menit", score:9},
        {key:"late5", label:"Terlambat 3–5 menit", score:8},
        {key:"late10", label:"Terlambat 6–10 menit", score:7},
        {key:"late15", label:"Terlambat 11–15 menit", score:6},
        {key:"late20", label:"Terlambat 16–20 menit", score:5},
        {key:"late30", label:"Terlambat 21–30 menit", score:4},
        {key:"lateover", label:"Terlambat > 30 menit", score:3},
        {key:"permit", label:"Izin resmi", score:null},
        {key:"sick", label:"Sakit", score:null},
        {key:"unexcused", label:"Tidak hadir tanpa keterangan", score:1}
      ]
    },
    computer: {
      label: "Komputer/Laptop",
      icon: "💻",
      indicators: [
        {key:"operation", label:"Operasional Laptop", weight:10, hint:"Pengoperasian perangkat dasar secara mandiri."},
        {key:"files", label:"Manajemen File dan Folder", weight:15, hint:"Membuat, menamai, memindah, mencari, dan menyimpan file."},
        {key:"word", label:"Microsoft Word", weight:25, hint:"Format dokumen, tabel, gambar, halaman, ekspor PDF."},
        {key:"excel", label:"Microsoft Excel", weight:20, hint:"Input data, tabel, rumus dasar, sort/filter, grafik."},
        {key:"ppt", label:"PowerPoint", weight:15, hint:"Membuat presentasi yang terstruktur dan terbaca."},
        {key:"digital", label:"Internet, Email, Cloud & Keamanan", weight:15, hint:"Pencarian, unggah/unduh, email, cloud, keamanan akun."}
      ]
    },
    scientific: {
      label: "Karya Ilmiah",
      icon: "📝",
      indicators: [
        {key:"problem", label:"Masalah/Judul", weight:10, hint:"Ketepatan merumuskan masalah dan judul."},
        {key:"structure", label:"Sistematika Tulisan", weight:15, hint:"Kelengkapan dan urutan bagian karya ilmiah."},
        {key:"references", label:"Penggunaan Referensi", weight:15, hint:"Relevansi dan kualitas sumber yang digunakan."},
        {key:"citation", label:"Kutipan dan Sitasi", weight:15, hint:"Ketepatan mengutip dan menyusun sitasi."},
        {key:"discussion", label:"Analisis/Pembahasan", weight:20, hint:"Logika, kedalaman analisis, hubungan data dan sumber."},
        {key:"language", label:"Bahasa Ilmiah", weight:10, hint:"Bahasa baku, jelas, efektif, dan akademik."},
        {key:"ethics", label:"Etika Akademik", weight:10, hint:"Orisinalitas, atribusi sumber, penggunaan AI bertanggung jawab."},
        {key:"presentation", label:"Presentasi", weight:5, hint:"Penyampaian ringkas, runtut, dan mampu menjawab pertanyaan."}
      ]
    },
    ppkk: {
      label: "PPKK",
      icon: "📘",
      indicators: [
        {key:"knowledge", label:"Pengetahuan PPKK", weight:25, hint:"Mengetahui ketentuan kehidupan kampus."},
        {key:"understanding", label:"Pemahaman PPKK", weight:25, hint:"Memahami tujuan dan alasan di balik ketentuan."},
        {key:"case", label:"Analisis Studi Kasus", weight:25, hint:"Mampu menentukan tindakan tepat pada situasi nyata."},
        {key:"implementation", label:"Implementasi", weight:25, hint:"Konsistensi perilaku sehari-hari sesuai PPKK."}
      ]
    }
  }
};
