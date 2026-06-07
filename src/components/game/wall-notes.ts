export type WallNote = {
  id: string;
  title: string;
  body: string;
  color: string;
  attribution?: string;
  scale?: number;
  position: [number, number, number];
  rotation: [number, number, number];
};

export const wallNotes: WallNote[] = [
  {
    id: "west-01",
    title: "Dairesel Sabah",
    body:
      "Zaman doğrusal değil sanki; aynı sabahın içine uyanıp duruyorum.",
    color: "#f4db7c",
    scale: 1.02,
    position: [-3.56, 2.02, 1.58],
    rotation: [0, Math.PI / 2, -0.1],
  },
  {
    id: "west-02",
    title: "Uçurum Çizgisi",
    body:
      "Uçuruma uzun süre bakarsan, uçurum da senin içine bakar. Ve ben çok uzun zamandır burada, gözlerimi kırpmadan duruyorum.",
    attribution: "— Friedrich Nietzsche, İyinin ve Kötünün Ötesinde",
    color: "#ffd3ad",
    scale: 0.94,
    position: [-3.56, 1.58, 0.98],
    rotation: [0, Math.PI / 2, 0.08],
  },
  {
    id: "west-03",
    title: "Sarkaç",
    body:
      "Hayat, acı ile sıkıntı arasında gidip gelen bir sarkaçtır.",
    attribution: "— Arthur Schopenhauer, Hayatın Anlamı",
    color: "#c8f2a8",
    scale: 0.9,
    position: [-3.56, 1.24, 0.34],
    rotation: [0, Math.PI / 2, -0.03],
  },
  {
    id: "west-04",
    title: "Gürültü",
    body:
      "Her şey çok gürültülü: hırslar, saatler, faturalar. Odanın sessizliği bu yüzden bu kadar yüksek.",
    color: "#f6c7d8",
    scale: 1.08,
    position: [-3.56, 1.88, -0.24],
    rotation: [0, Math.PI / 2, 0.11],
  },
  {
    id: "west-05",
    title: "Yetersiz Dil",
    body:
      "Kelimeler yetmiyor bazen. İçimdeki boşluk için hâlâ doğru bir dil bulunmadı.",
    color: "#d8ecff",
    scale: 0.96,
    position: [-3.56, 1.44, -0.92],
    rotation: [0, Math.PI / 2, -0.07],
  },
  {
    id: "west-06",
    title: "Duvara Kustuğum",
    body:
      "Zihnimi duvarlara kusuyorum; içimde tutarsam beni zehirliyorlar.",
    color: "#d5c8ff",
    scale: 1.05,
    position: [-3.56, 1.72, -1.54],
    rotation: [0, Math.PI / 2, 0.06],
  },
  {
    id: "north-01",
    title: "Porselen Evren",
    body:
      "Bulaşık yıkamak bile kozmik boşlukta garip bir ciddiyet gibi duruyor.",
    color: "#d7ef9a",
    scale: 1,
    position: [-2.28, 1.84, -3.56],
    rotation: [0, 0, -0.09],
  },
  {
    id: "north-02",
    title: "Kozmik Şaka",
    body:
      "Başarısızlıklarım, utancım, geçmişim... belki hepsi kozmik bir şakadan ibaret.",
    color: "#f5e6a3",
    scale: 0.92,
    position: [-1.26, 1.26, -3.56],
    rotation: [0, 0, 0.07],
  },
  {
    id: "north-03",
    title: "Boş Sayfalar",
    body:
      "Büyük bir kozmik kütüphanedeyiz; sayfalar boş, insan yine de bir şey yazmak istiyor.",
    color: "#f1c6d8",
    scale: 1.12,
    position: [-0.22, 1.58, -3.56],
    rotation: [0, 0, -0.02],
  },
  {
    id: "north-04",
    title: "Sabah Işığı",
    body:
      "Eğer her şey yok olacaksa, sabah ışığı neden hâlâ bu kadar büyüleyici geliyor?",
    color: "#c6ecff",
    scale: 0.94,
    position: [2.82, 2.02, -3.56],
    rotation: [0, 0, 0.09],
  },
  {
    id: "north-05",
    title: "Geçicilik",
    body:
      "Geçici olanın değeri, bazen kalıcı olduğu sanılan her şeyden daha büyük.",
    color: "#ffd8a0",
    scale: 1.04,
    position: [1.92, 1.34, -3.56],
    rotation: [0, 0, -0.05],
  },
  {
    id: "east-01",
    title: "Açık Boşluk",
    body:
      "Hayatın büyük bir anlamı olmayabilir; bazen bu, korkudan çok özgürlük veriyor.",
    color: "#f4c6ea",
    scale: 1.08,
    position: [3.56, 1.86, -1.48],
    rotation: [0, -Math.PI / 2, 0.1],
  },
  {
    id: "east-02",
    title: "Berrak Yudum",
    body:
      "Gelecek biraz uzaklaşınca kahvenin tadı bile daha berrak geliyor.",
    color: "#d8f1a6",
    scale: 0.9,
    position: [3.56, 1.34, -0.94],
    rotation: [0, -Math.PI / 2, -0.08],
  },
  {
    id: "east-03",
    title: "Şu An",
    body:
      "Sadece şu an varsa, o zaman havadaki toz bile görülmeye değer bir şeye dönüşüyor.",
    color: "#ccecff",
    scale: 1.02,
    position: [3.56, 2.02, -0.32],
    rotation: [0, -Math.PI / 2, 0.04],
  },
  {
    id: "east-04",
    title: "Yıldız Tozu",
    body:
      "Bir yıldız tozuyum; kendi varlığını düşünen bir kalıntı. Bunun absürtlüğü bile tek başına büyük.",
    color: "#f5dda5",
    scale: 0.96,
    position: [3.56, 1.22, 0.42],
    rotation: [0, -Math.PI / 2, 0.12],
  },
  {
    id: "east-05",
    title: "Taslak Gün",
    body:
      "Yargılayacak bir otorite yoksa, bugün sadece yarım bir taslak olarak da kalabilir.",
    color: "#ecd4ff",
    scale: 1.06,
    position: [3.56, 1.68, 1.04],
    rotation: [0, -Math.PI / 2, -0.06],
  },
  {
    id: "east-06",
    title: "Kavanoz Arkası",
    body:
      "Mutluluk bazen çok küçük ve komik bir şeydir; bir kavanozun dibinde bile saklanabilir.",
    color: "#f3e28c",
    scale: 0.92,
    position: [3.56, 1.08, 1.54],
    rotation: [0, -Math.PI / 2, 0.05],
  },
  {
    id: "south-01",
    title: "Yük ve Hafiflik",
    body:
      "Bu sabaha benden daha büyük bir anlam yükleyen yok. Bu hem yük, hem tuhaf bir hafiflik.",
    color: "#cfe8a2",
    scale: 1.04,
    position: [-2.08, 1.72, 3.56],
    rotation: [0, Math.PI, -0.05],
  },
  {
    id: "south-02",
    title: "Kendi Cümlem",
    body:
      "Kimse bana hazır bir cümle vermeyecekse, bugünü en azından kendi sesimle kurabilirim.",
    color: "#cde8ff",
    scale: 0.92,
    position: [-1.02, 1.18, 3.56],
    rotation: [0, Math.PI, 0.09],
  },
  {
    id: "south-03",
    title: "Özgürlüğe Mahkûm",
    body:
      "İnsan özgürlüğe mahkûmdur; çünkü dünyaya atıldıktan sonra yaptığı her seçimden tek başına sorumludur.",
    attribution: "— Jean-Paul Sartre, Varoluşçuluk Bir Hümanizmdir",
    color: "#f8d7b0",
    scale: 1.1,
    position: [0.08, 1.92, 3.56],
    rotation: [0, Math.PI, -0.08],
  },
  {
    id: "south-04",
    title: "Küçük Ayrıntı",
    body:
      "Belki mesele hayatı çözmek değil; odanın içindeki en küçük ayrıntıyı bile fark etmek.",
    color: "#d8f2b1",
    scale: 0.98,
    position: [1.18, 1.4, 3.56],
    rotation: [0, Math.PI, 0.06],
  },
  {
    id: "south-05",
    title: "Hammadde",
    body:
      "Anlamsızlık bazen güzelliğin hammaddesi gibi. Işık duvara vurduğunda bunu unutamıyorum.",
    color: "#e4d0ff",
    scale: 1.06,
    position: [2.14, 1.76, 3.56],
    rotation: [0, Math.PI, -0.04],
  },
] as const;
