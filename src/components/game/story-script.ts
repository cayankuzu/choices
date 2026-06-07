export const openingMonologue = [
  "Uyandın.",
  "Tavan yine aynı tavan. Ama bu sabah biraz daha alçakmış gibi.",
  "Evet... bugün.",
  "Garip olan şu: bedenim dinlenmiş. Sanki zihnimden haberi yok.",
  "Uzun zamandır ilk kez bu kadar deliksiz uyudum.",
  "Kalk artık. Ev sessiz. Kafanın içi değil.",
] as const;

export const standingMonologue = [
  "Ayağa kalkınca düşünceler de peşimden geliyor.",
  "Ev küçük değil aslında. Ama bugün her şey omzuma biraz daha yakın.",
] as const;

export const jarNarration = {
  jam: [
    "Şeker tadı bir anlığına çocukluğa benziyor. Geçiyor tabii.",
    "Tat ağırlaştı. Yine de insan böyle küçük şeylere tutunuyor.",
    "Midem değil de kafam doluyor sanki.",
    "Aynı boşluk, aynı oyalanma. Sadece kaşığın yeri değişiyor.",
    "Demek insan bazen sadece vakit geçirmek için bile tatlı şeylere sarılıyor.",
    "Hepsi bitti. Boşluk kaldı.",
  ],
  chocolate: [
    "Bu tat neredeyse çocukça. O yüzden biraz daha acıtıyor galiba.",
    "Tatlı şeyler düşünceleri susturmuyor; sadece biraz yavaşlatıyor.",
    "Zaman bir anlığına yoğunlaşıyor. Sonra yine aynı yere dönüyor.",
    "Şekerin verdiği huzur çok kısa sürüyor. Bedeni kandırmak kolaymış.",
    "Azaldı. İçindeki boşlukla bendeki boşluk birbirine benziyor.",
    "Dip göründü. İçimdeki ses kaldı.",
  ],
} as const;

export const jarEmptyNarration = {
  jam: "Cam boş. Oyalanma da bitti.",
  chocolate: "Dip göründü. Sesler yerinde duruyor.",
} as const;

export const gunNarration = {
  take: "Metal soğuk. Ama beni geren şey soğukluğu değil, sessizliği.",
  steady:
    "Bir nesne bazen sadece nesne gibi kalmıyor. Elde büyüyor, akılda daha da çok.",
  drop:
    "Bırakınca oda bir an daha genişliyor. Sonra yine aynı dar yere dönüyor.",
} as const;

export const collapseNarration = {
  priming: [
    "Sağ kolum yükseliyor. Oda bir anda kısılıyor.",
    "Başımı sağa çevirince metal görüşümün kenarında beliriyor.",
    "İçimdeki son cümle de biter bitmez her şey kapanacak gibi.",
  ],
  surging: [
    "Bakışımı tekrar karşıya topluyorum. Nefes daralıyor.",
    "Göz kapaklarım dışarıdan değil, içerden ağırlaşıyor.",
  ],
  falling: [],
  closing: [],
  blackout:
    "Sonra yalnızca karanlık kalıyor; oda uzakta, bilinç askıda.",
} as const;

export const interactionLabels = {
  jam: "Reçel Kavanozu",
  chocolate: "Kakaolu Krem Kavanozu",
  gun: "Silah",
} as const;
