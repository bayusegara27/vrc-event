/**
 * Komponen jadwal acara.
 *
 * Satu berkas, dipakai empat kali: beranda konsol, ruang penyelenggara, ruang
 * pengelola, dan situs publik yang terbit ke GitHub Pages. Karena itu ia tidak
 * boleh bergantung pada backend — cukup diberi larik acara persis seperti isi
 * events.json.
 *
 * Tiga hal yang membuat daftar acara terasa hidup, dan dulu tidak ada satu pun
 * di konsol ini:
 *
 *   1. poster acaranya kelihatan          — warnanya datang dari acaranya
 *   2. yang sedang berlangsung ditandai   — pertanyaan tersering pemain
 *   3. jamnya dalam zona waktu pembaca    — bukan jam penyelenggara mentah
 *
 * Menyuntikkan gayanya sendiri supaya situs publik cukup memuat satu berkas.
 */
(function (global) {
  "use strict";

  const HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

  // Nama platform apa adanya. Kalau VRChat menambah platform keempat, cukup
  // menambah satu baris di sini dan satu ikon.
  const PLATFORM = [
    { kunci: "windows", nama: "Windows" },
    { kunci: "android", nama: "Android" },
    { kunci: "ios",     nama: "iOS" },
  ];

  // ==================================================================== gaya
  const GAYA = `
.jw{--jw-ink:#EDE7DC;--jw-ink-2:#A79E90;--jw-ink-3:#8B8378;
    --jw-rule:#2A241D;--jw-rule-2:#3D3428;--jw-sunk:#110E0B;--jw-card:#1B1712;
    --jw-live:#3ECFB2;--jw-live-dim:#0F2E29;--jw-hold:#D9A441;--jw-hold-dim:#2E2513;
    --jw-stop:#D9614C;--jw-stop-dim:#2C1712;
    color:var(--jw-ink);font-family:inherit}

.jw-live-strip{border:1px solid var(--jw-live);background:var(--jw-live-dim);
    border-radius:8px;padding:12px 14px;margin:0 0 18px}
.jw-live-strip .jw-kap{display:flex;align-items:center;gap:7px;
    font-family:var(--jw-mono,monospace);font-size:10.5px;font-weight:700;
    letter-spacing:.14em;text-transform:uppercase;color:var(--jw-live);margin-bottom:9px}
.jw-denyut{width:7px;height:7px;border-radius:50%;background:var(--jw-live);
    animation:jw-denyut 2s ease-in-out infinite}
@keyframes jw-denyut{0%,100%{opacity:1}50%{opacity:.35}}
@media(prefers-reduced-motion:reduce){.jw-denyut{animation:none}}

.jw-next{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;
    padding:9px 0 16px;border-bottom:1px solid var(--jw-rule);margin-bottom:6px;
    font-size:13.5px;color:var(--jw-ink-2)}
.jw-next b{color:var(--jw-ink);font-weight:600}
.jw-next .jw-hitung{font-family:var(--jw-mono,monospace);color:var(--jw-hold);
    font-variant-numeric:tabular-nums}

.jw-hari{display:flex;align-items:baseline;gap:10px;padding:20px 0 7px}
.jw-hari .jw-tgl{font-size:19px;font-weight:700;line-height:1;
    font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.jw-hari .jw-nama{font-family:var(--jw-mono,monospace);font-size:10.5px;
    letter-spacing:.13em;text-transform:uppercase;color:var(--jw-ink-3)}
.jw-hari::after{content:"";flex:1;height:1px;background:var(--jw-rule)}
.jw-hari.jw-ini .jw-tgl{color:var(--jw-live)}

.jw-baris{display:grid;grid-template-columns:auto 1fr auto;gap:0 13px;
    padding:10px 0;border-bottom:1px solid var(--jw-rule);align-items:start;
    text-align:left;width:100%;background:none;border-left:none;border-right:none;
    border-top:none;font:inherit;color:inherit}
.jw-baris[data-klik]{cursor:pointer}
.jw-baris[data-klik]:hover{background:var(--jw-sunk)}
.jw-baris.jw-pilih{background:var(--jw-sunk);box-shadow:inset 2px 0 0 var(--jw-live)}

.jw-poster{width:52px;aspect-ratio:4/5;border-radius:4px;overflow:hidden;
    background:var(--jw-card);border:1px solid var(--jw-rule-2);
    display:flex;align-items:center;justify-content:center}
.jw-poster img{width:100%;height:100%;object-fit:cover;display:block}
.jw-poster span{font-family:var(--jw-mono,monospace);font-size:15px;color:var(--jw-ink-3)}

.jw-isi{min-width:0}
.jw-jam{font-family:var(--jw-mono,monospace);font-size:11.5px;
    font-variant-numeric:tabular-nums;color:var(--jw-ink-2);
    display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px}
.jw-jam .jw-asal{color:var(--jw-ink-3)}
/* Judul boleh turun ke baris kedua. Memotongnya dengan elipsis baru masuk
   akal kalau barisnya bisa diklik untuk melihat sisanya — di situs publik
   tidak bisa, jadi judul terpotong berarti jalan buntu. */
.jw-judul{font-size:16px;font-weight:600;line-height:1.3;letter-spacing:-.005em;
    overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;
    -webkit-line-clamp:2;line-clamp:2}
.jw-oleh{font-size:12.5px;color:var(--jw-ink-3);margin-top:1px;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.jw-kanan{display:flex;flex-direction:column;align-items:flex-end;gap:5px}
.jw-plat{display:flex;gap:4px}
.jw-plat img,.jw-plat span{width:20px;height:20px;display:block}
.jw-plat span{font-family:var(--jw-mono,monospace);font-size:9px;line-height:20px;
    text-align:center;color:var(--jw-ink-3);border:1px solid var(--jw-rule-2);
    border-radius:3px;width:auto;padding:0 4px}
.jw-tanda{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}
.jw-tag{font-family:var(--jw-mono,monospace);font-size:9px;letter-spacing:.07em;
    text-transform:uppercase;padding:2px 5px;border-radius:2px;
    border:1px solid var(--jw-rule-2);color:var(--jw-ink-3);white-space:nowrap}
.jw-tag.jw-t-live{color:var(--jw-live);border-color:var(--jw-live);background:var(--jw-live-dim)}
.jw-tag.jw-t-hold{color:var(--jw-hold);border-color:var(--jw-hold);background:var(--jw-hold-dim)}
.jw-tag.jw-t-stop{color:var(--jw-stop);border-color:var(--jw-stop);background:var(--jw-stop-dim)}
.jw-tag.jw-t-sorot{color:var(--jw-hold);border-color:var(--jw-hold)}

.jw-baris.jw-berlangsung{background:linear-gradient(90deg,var(--jw-live-dim),transparent 60%)}

/* Di dalam strip semuanya sudah pasti berlangsung, jadi barisnya cukup
   ringkas: strip itu penunjuk, bukan salinan kedua daftarnya. */
.jw-live-strip .jw-baris{grid-template-columns:34px 1fr auto;gap:0 10px;padding:6px 0;
    border-bottom:1px solid rgba(62,207,178,.16);background:none}
.jw-live-strip .jw-baris:last-child{border-bottom:none}
.jw-live-strip .jw-baris:hover{background:rgba(62,207,178,.07)}
.jw-live-strip .jw-poster{width:34px;border-color:rgba(62,207,178,.3)}
.jw-live-strip .jw-judul{font-size:14.5px}
.jw-live-strip .jw-jam{font-size:11px;margin-bottom:0}
.jw-live-strip .jw-oleh{display:none}
.jw-live-strip .jw-kanan{flex-direction:row;align-items:center;gap:8px}
.jw-baris.jw-lewat{opacity:.5}

.jw-kosong{padding:38px 0;color:var(--jw-ink-3);font-size:13.5px;max-width:46ch}
.jw-kosong b{display:block;color:var(--jw-ink-2);font-size:17px;font-weight:600;
    margin-bottom:6px}
.jw-kosong .jw-aksi{margin-top:14px}
`;

  function pasangGaya() {
    if (document.getElementById("jw-gaya")) return;
    const s = document.createElement("style");
    s.id = "jw-gaya";
    s.textContent = GAYA;
    document.head.appendChild(s);
  }

  // ================================================================= waktu
  const p2 = (n) => String(n).padStart(2, "0");
  const jam = (d) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;

  /** Nama zona pembaca, mis. "WIB" untuk GMT+7 atau "GMT+9". */
  function zonaPembaca() {
    const m = -new Date().getTimezoneOffset();
    if (m === 420) return "WIB";
    if (m === 480) return "WITA";
    if (m === 540) return "WIT";
    const t = m < 0 ? "-" : "+";
    const a = Math.floor(Math.abs(m) / 60), b = Math.abs(m) % 60;
    return `GMT${t}${a}${b ? ":" + p2(b) : ""}`;
  }

  /**
   * Zona asal dari stempel waktunya sendiri.
   * Offset ikut di string ISO, jadi tidak perlu menebak.
   */
  function zonaAsal(iso) {
    const m = /([+-])(\d{2}):(\d{2})$/.exec(iso);
    if (!m) return /Z$/i.test(iso) ? "UTC" : "";
    const menit = (+m[2] * 60 + +m[3]) * (m[1] === "-" ? -1 : 1);
    if (menit === 420) return "WIB";
    if (menit === 480) return "WITA";
    if (menit === 540) return "WIT";
    return `GMT${m[1]}${+m[2]}${+m[3] ? ":" + m[3] : ""}`;
  }

  /** "Hari ini", "Besok", atau tanggal. Bahasa yang dipakai orang. */
  function namaHari(d, now) {
    const h = new Date(d); h.setHours(0, 0, 0, 0);
    const n = new Date(now); n.setHours(0, 0, 0, 0);
    const beda = Math.round((h - n) / 86400000);
    if (beda === 0) return "Hari ini";
    if (beda === 1) return "Besok";
    if (beda === -1) return "Kemarin";
    // Tahun hanya ditulis kalau beda; "31 Kamis · Des" cukup jelas dalam
    // tahun berjalan, tapi menyesatkan begitu daftarnya melewati Januari.
    const thn = d.getFullYear() !== now.getFullYear() ? ` ${d.getFullYear()}` : "";
    return `${HARI[d.getDay()]} · ${BULAN[d.getMonth()]}${thn}`;
  }

  /** "2 jam 15 menit lagi" — cukup kasar, tidak perlu detik. */
  function selisihKasar(ms) {
    const menit = Math.round(ms / 60000);
    if (menit < 1) return "sebentar lagi";
    if (menit < 60) return `${menit} menit lagi`;
    const j = Math.floor(menit / 60), m = menit % 60;
    if (j < 24) return m ? `${j} jam ${m} menit lagi` : `${j} jam lagi`;
    return `${Math.round(j / 24)} hari lagi`;
  }

  // ================================================================ render
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function platformHtml(e, ikonUrl) {
    const aktif = PLATFORM.filter((p) => e[p.kunci]);
    if (!aktif.length) return "";
    return `<div class="jw-plat">` + aktif.map((p) => {
      const u = ikonUrl ? ikonUrl(p.kunci) : null;
      return u ? `<img src="${esc(u)}" alt="${p.nama}" title="${p.nama}"
                    onerror="this.style.display='none'">`
               : `<span title="${p.nama}">${p.nama.slice(0, 3)}</span>`;
    }).join("") + `</div>`;
  }

  function barisHtml(e, opsi, now, ringkas) {
    const mulai = new Date(e.start), selesai = new Date(e.end);
    const berlangsung = now >= mulai && now < selesai;
    const lewat = now >= selesai;

    const zonaP = zonaPembaca(), zonaA = zonaAsal(e.start);
    const jamAsal = zonaA && zonaA !== zonaP
      ? `<span class="jw-asal">${esc(zonaA)} ${esc(e.start.slice(11, 16))}</span>` : "";

    // Dua sumber poster. Situs publik memakai nomor slot, karena itu yang ada
    // di events.json; konsol memakai poster milik acaranya, karena di sana slot
    // belum dibagikan.
    const alamat = opsi.posterUrl ? opsi.posterUrl(e)
      : (e.poster_slot != null && e.poster_slot >= 0 && opsi.slotUrl)
        ? opsi.slotUrl(e.poster_slot) : null;
    // Kolom poster dihilangkan sama sekali kalau tidak ada gambarnya dan
    // pemanggil memang memintanya. Deretan kotak kosong lebih buruk daripada
    // baris yang sedikit lebih rapat.
    const adaKolom = alamat || !opsi.tanpaKotakPoster;
    const poster = alamat
      ? `<img src="${esc(alamat)}" alt="" loading="lazy"
             onerror="this.parentNode.innerHTML='<span>—</span>'">`
      : `<span>—</span>`;

    // Di dalam strip lencana "berlangsung" tidak memberi tahu apa-apa:
    // judul stripnya sudah mengatakannya.
    const tanda = [];
    if (berlangsung && !ringkas) tanda.push(`<span class="jw-tag jw-t-live">berlangsung</span>`);
    if (opsi.tandaTambahan && !ringkas) tanda.push(...opsi.tandaTambahan(e));

    const oleh = [e.author, (e.genres || []).join(", ")].filter(Boolean).join(" · ");
    const tag = opsi.onClick ? "button" : "div";
    const klik = opsi.onClick ? ' data-klik="1" type="button"' : "";

    return `<${tag} class="jw-baris${berlangsung ? " jw-berlangsung" : ""}` +
      `${lewat && !berlangsung ? " jw-lewat" : ""}` +
      `${opsi.dipilih === e.id ? " jw-pilih" : ""}" data-id="${esc(e.id)}"${klik}>
  ${adaKolom ? `<div class="jw-poster">${poster}</div>` : ""}
  <div class="jw-isi">
    <div class="jw-jam"><span>${jam(mulai)} – ${jam(selesai)} ${esc(zonaP)}</span>${jamAsal}</div>
    <div class="jw-judul">${esc(e.title)}</div>
    ${oleh ? `<div class="jw-oleh">${esc(oleh)}</div>` : ""}
  </div>
  <div class="jw-kanan">${platformHtml(e, opsi.ikonUrl)}
    ${tanda.length ? `<div class="jw-tanda">${tanda.join("")}</div>` : ""}</div>
</${tag}>`;
  }

  /**
   * Menggambar jadwal ke dalam sebuah elemen.
   *
   * @param {HTMLElement} wadah
   * @param {object} opsi
   *   events        larik acara, bentuknya persis events.json
   *   slotUrl       (n) => alamat poster slot n
   *   posterUrl     (acara) => alamat poster acara, atau null
   *   ikonUrl       (kunci) => alamat ikon platform
   *   onClick       (acara) => void; kalau ada, barisnya jadi tombol
   *   dipilih       id acara yang sedang disorot
   *   tandaTambahan (acara) => larik html lencana tambahan
   *   sembunyikanLewat  buang acara yang sudah selesai
   *   kosong        { judul, pesan, aksi }
   */
  function gambar(wadah, opsi) {
    pasangGaya();
    wadah.classList.add("jw");

    const now = opsi.now || new Date();
    let acara = [...(opsi.events || [])]
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    // Situs publik memakai ini: pengunjung datang untuk tahu apa yang akan
    // datang, bukan untuk membaca arsip. Konsol membiarkannya mati supaya
    // penyelenggara tetap melihat acaranya sendiri setelah selesai.
    if (opsi.sembunyikanLewat) acara = acara.filter((e) => new Date(e.end) > now);

    if (!acara.length) {
      const k = opsi.kosong || {};
      wadah.innerHTML = `<div class="jw-kosong">
        <b>${esc(k.judul || "Belum ada acara")}</b>
        ${esc(k.pesan || "Begitu ada acara terjadwal, semuanya muncul di sini.")}
        ${k.aksi ? `<div class="jw-aksi">${k.aksi}</div>` : ""}</div>`;
      return;
    }

    let html = "";

    // Yang sedang berlangsung naik ke atas: itu pertanyaan yang paling sering
    // ditanyakan, dan mencarinya di tengah daftar bukan jawaban.
    const kini = acara.filter((e) => now >= new Date(e.start) && now < new Date(e.end));
    if (kini.length) {
      html += `<div class="jw-live-strip"><div class="jw-kap">
        <span class="jw-denyut"></span>Sedang berlangsung</div>`
        + kini.map((e) => barisHtml(e, opsi, now, true)).join("") + `</div>`;
    }

    // Baris ini selalu ada. Kalau tidak ada acara di depan, itu justru
    // jawaban yang dicari pengunjung — jangan diam saja dan biarkan ia
    // menyimpulkan sendiri dari daftar yang semuanya pudar.
    const berikut = acara.find((e) => new Date(e.start) > now);
    html += berikut
      ? `<div class="jw-next">Berikutnya <b>${esc(berikut.title)}</b>
          <span class="jw-hitung">${selisihKasar(new Date(berikut.start) - now)}</span></div>`
      : `<div class="jw-next">Belum ada acara terjadwal berikutnya.</div>`;

    let hariTerakhir = "";
    for (const e of acara) {
      const d = new Date(e.start);
      const kunci = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
      if (kunci !== hariTerakhir) {
        hariTerakhir = kunci;
        const iniHari = namaHari(d, now) === "Hari ini";
        html += `<div class="jw-hari${iniHari ? " jw-ini" : ""}">
          <span class="jw-tgl">${p2(d.getDate())}</span>
          <span class="jw-nama">${esc(namaHari(d, now))}</span></div>`;
      }
      html += barisHtml(e, opsi, now);
    }

    wadah.innerHTML = html;

    if (opsi.onClick) {
      wadah.querySelectorAll("[data-klik]").forEach((el) => {
        el.onclick = () => {
          const e = acara.find((x) => x.id === el.dataset.id);
          if (e) opsi.onClick(e);
        };
      });
    }
  }

  global.Jadwal = { gambar, zonaPembaca, zonaAsal, namaHari, selisihKasar };
})(window);
