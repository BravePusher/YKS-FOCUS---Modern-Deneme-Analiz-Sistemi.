import { SubjectList } from './types';

export const SUBJECTS: SubjectList = {
  'TYT Türkçe': [
    'Sözcükte Anlam', 'Cümlede Anlam', 'Paragraf', 'Ses Bilgisi', 'Yazım Kuralları', 
    'Noktalama İşaretleri', 'Sözcükte Yapı', 'İsimler', 'Sıfatlar', 'Zamirler', 
    'Zarflar', 'Edat-Bağlaç-Ünlem', 'Fiiller', 'Cümle Ögeleri', 'Cümle Türleri', 
    'Anlatım Bozuklukları'
  ],
  'TYT Matematik': [
    'Temel Kavramlar', 'Sayı Basamakları', 'Bölme ve Bölünebilme', 'Asal Çarpanlar', 
    'EBOB-EKOK', 'Rasyonel Sayılar', 'Basit Eşitsizlikler', 'Mutlak Değer', 
    'Üslü Sayılar', 'Köklü Sayılar', 'Çarpanlara Ayırma', 'Oran-Orantı', 
    'Denklem Çözme', 'Problemler', 'Kümeler', 'Fonksiyonlar', 
    'Permütasyon-Kombinasyon', 'Binom', 'Olasılık', 'İstatistik'
  ],
  'TYT Geometri': [
    'Doğruda ve Üçgende Açılar', 'Özel Üçgenler', 'Üçgende Alan ve Benzerlik', 
    'Çokgenler', 'Dörtgenler', 'Çember ve Daire', 'Analitik Geometri', 'Katı Cisimler'
  ],
  'TYT Fizik': [
    'Fizik Bilimine Giriş', 'Madde ve Özellikleri', 'Hareket ve Kuvvet', 'Enerji', 
    'Isı, Sıcaklık ve Genleşme', 'Elektrostatik', 'Elektrik ve Manyetizma', 
    'Basınç ve Kaldırma Kuvveti', 'Dalgalar', 'Optik'
  ],
  'TYT Kimya': [
    'Kimya Bilimi', 'Atom ve Periyodik Sistem', 'Kimyasal Türler Arası Etkileşimler', 
    'Maddenin Halleri', 'Doğa ve Kimya', 'Kimyanın Temel Kanunları', 'Mol Kavramı', 
    'Kimyasal Tepkimeler', 'Karışımlar', 'Asitler, Bazlar ve Tuzlar', 'Kimya Her Yerde'
  ],
  'TYT Biyoloji': [
    'Canlıların Ortak Özellikleri', 'Canlıların Temel Bileşenleri', 'Hücre', 
    'Canlıların Çeşitliliği ve Sınıflandırılması', 'Hücre Bölünmeleri', 'Kalıtım', 
    'Ekosistem Ekolojisi'
  ],
  'TYT Sosyal': [
    'Tarih Bilimi', 'İlk Çağ Uygarlıkları', 'İslam Tarihi', 'Orta Çağda Dünya', 
    'Osmanlı Devleti', 'Milli Mücadele', 'Atatürk İlkeleri', 'Doğa ve İnsan', 
    'Dünya’nın Şekli ve Hareketleri', 'Harita Bilgisi', 'İklim Bilgisi', 
    'Yer’in Şekillenmesi', 'Nüfus ve Yerleşme', 'Bölgeler ve Ülkeler', 
    'Doğal Afetler', 'Felsefe ile Tanışma', 'Bilgi Felsefesi', 'Varlık Felsefesi', 
    'Ahlak Felsefesi', 'Sanat Felsefesi', 'Din Felsefesi', 'Siyaset Felsefesi', 
    'Bilim Felsefesi', 'Bilgi ve İnanç', 'Din ve İslam', 'İslam ve İbadet', 
    'Hz. Muhammed (S.A.V)', 'Vahiy ve Akıl'
  ],
  'AYT Matematik': [
    'Fonksiyonlar', 'Polinomlar', 'İkinci Dereceden Denklemler', 'Karmaşık Sayılar', 
    'Parabol', 'Eşitsizlikler', 'Logaritma', 'Diziler', 'Trigonometri', 
    'Limit ve Süreklilik', 'Türev', 'İntegral'
  ],
  'AYT Fizik': [
    'Vektörler', 'Bağlı Hareket', 'Newton’un Hareket Yasaları', 
    'Bir Boyutta Sabit İvmeli Hareket', 'İki Boyutta Hareket', 'Enerji ve Hareket', 
    'İtme ve Çizgisel Momentum', 'Tork ve Denge', 'Elektriksel Kuvvet ve Alan', 
    'Manyetizma ve Elektromanyetik İndükleme', 'Alternatif Akım', 'Çembersel Hareket', 
    'Basit Harmonik Hareket', 'Dalga Mekaniği', 'Atom Fiziğine Giriş', 'Modern Fizik'
  ],
  'AYT Kimya': [
    'Modern Atom Teorisi', 'Gazlar', 'Sıvı Çözeltiler ve Derişim', 
    'Kimyasal Tepkimelerde Enerji', 'Kimyasal Tepkimelerde Hız', 'Kimyasal Denge', 
    'Asit-Baz Dengesi', 'Çözünürlük Dengesi', 'Kimya ve Elektrik', 
    'Karbon Kimyasına Giriş', 'Organik Bileşikler'
  ],
  'AYT Biyoloji': [
    'Denetleyici ve Düzenleyici Sistemler', 'Duyu Organları', 'Destek ve Hareket Sistemi', 
    'Sindirim Sistemi', 'Dolaşım ve Bağışıklık Sistemi', 'Solunum Sistemi', 
    'Boşaltım Sistemi', 'Üreme Sistemi ve Embriyonik Gelişim', 
    'Komünite ve Popülasyon Ekolojisi', 'Nükleik Asitler', 
    'Genetik Şifre ve Protein Sentezi', 'Canlılarda Enerji Dönüşümleri', 
    'Bitki Biyolojisi', 'Canlılar ve Çevre'
  ]
};

// Default subjects for sections not explicitly listed if needed
export const OTHER_SUBJECTS = ['Genel / Diğer'];

export const TYT_SECTIONS = [
  { name: 'Türkçe', count: 40, subjects: SUBJECTS['TYT Türkçe'] },
  { name: 'Sosyal Bilimler', count: 20, subjects: SUBJECTS['TYT Sosyal'] },
  { name: 'Matematik', count: 40, subjects: [...SUBJECTS['TYT Matematik'], ...SUBJECTS['TYT Geometri']] },
  { name: 'Fen Bilimleri', count: 20, subjects: [...SUBJECTS['TYT Fizik'], ...SUBJECTS['TYT Kimya'], ...SUBJECTS['TYT Biyoloji']] }
];

export const AYT_SECTIONS = [
  { name: 'Matematik', count: 40, subjects: SUBJECTS['AYT Matematik'] },
  { name: 'Fen Bilimleri', count: 40, subjects: [...SUBJECTS['AYT Fizik'], ...SUBJECTS['AYT Kimya'], ...SUBJECTS['AYT Biyoloji']] }
];
