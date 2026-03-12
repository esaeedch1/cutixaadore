'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'English' | 'Urdu' | 'Arabic' | 'Chinese' | 'Sri Lankan' | 'Nepali' | 'Malaysian' | 'Indonesian';

const translations: Record<Language, Record<string, string>> = {
    English: {
        'Select Country': 'Select Country',
        'Shop': 'Shop',
        'Owner': 'Owner',
        'Login/Register': 'Login/Register',
        'Contact Us': 'Contact Us',
        'Add to Cart': 'Add to Cart',
        'Cart': 'Cart',
        'Categories': 'Categories',
        'Mens': 'Mens',
        'Women': 'Women',
        'Fragrances': 'Fragrances',
        'Beauty & Self Care': 'Beauty & Self Care',
        'Special Offers': 'Special Offers',
        'Checkout': 'Checkout',
        'Continue Shopping': 'Continue Shopping',
        'Coming Soon.....': 'Coming Soon.....'
    },
    Urdu: {
        'Select Country': 'ملک منتخب کریں',
        'Shop': 'دکان',
        'Owner': 'مالک',
        'Login/Register': 'لاگ ان/رجسٹر',
        'Contact Us': 'ہم سے رابطہ کریں',
        'Add to Cart': 'ٹوکری میں ڈالیں',
        'Cart': 'ٹوکری',
        'Categories': 'اقسام',
        'Mens': 'مردانہ',
        'Women': 'خواتین',
        'Fragrances': 'خوشبوئیں',
        'Beauty & Self Care': 'خوبصورتی اور خود نگہداشت',
        'Special Offers': 'خصوصی پیشکشیں',
        'Checkout': 'چیک آؤٹ',
        'Continue Shopping': 'خریداری جاری رکھیں',
        'Coming Soon.....': 'جلد آ رہا ہے.....'
    },
    Arabic: {
        'Select Country': 'اختر الدولة',
        'Shop': 'متجر',
        'Owner': 'صاحب المحل',
        'Login/Register': 'تسجيل الدخول / تسجيل',
        'Contact Us': 'اتصل بنا',
        'Add to Cart': 'أضف إلى السلة',
        'Cart': 'سلة التسوق',
        'Categories': 'الفئات',
        'Mens': 'رجال',
        'Women': 'نساء',
        'Fragrances': 'عطور',
        'Beauty & Self Care': 'الجمال والعناية الشخصية',
        'Special Offers': 'عروض خاصة',
        'Checkout': 'الدفع',
        'Continue Shopping': 'مواصلة التسوق',
        'Coming Soon.....': 'قريباً.....'
    },
    Chinese: {
        'Select Country': '选择国家',
        'Shop': '商店',
        'Owner': '店主',
        'Login/Register': '登录/注册',
        'Contact Us': '联系我们',
        'Add to Cart': '加入购物车',
        'Cart': '购物车',
        'Categories': '类别',
        'Mens': '男性',
        'Women': '女性',
        'Fragrances': '香水',
        'Beauty & Self Care': '美容与个人护理',
        'Special Offers': '特别优惠',
        'Checkout': '结账',
        'Continue Shopping': '继续购物',
        'Coming Soon.....': '即将推出.....'
    },
    'Sri Lankan': {
        'Select Country': 'රට තෝරන්න',
        'Shop': 'වෙළඳසැල',
        'Owner': 'අයිතිකරු',
        'Login/Register': 'පුරනය වන්න/ලියාපදිංචි වන්න',
        'Contact Us': 'අප අමතන්න',
        'Add to Cart': 'කරත්තයට එක් කරන්න',
        'Cart': 'කරත්තය',
        'Categories': 'ප්‍රවර්ග',
        'Mens': 'පිරිමි',
        'Women': 'කාන්තා',
        'Fragrances': 'සුවඳ විලවුන්',
        'Beauty & Self Care': 'රූපලාවන්‍ය සහ ස්වයං රැකවරණය',
        'Special Offers': 'විශේෂ දීමනා',
        'Checkout': 'පරීක්ෂා කරන්න',
        'Continue Shopping': 'දිගටම සාප්පු යන්න',
        'Coming Soon.....': 'ළඟදීම.....'
    },
    'Nepali': {
        'Select Country': 'देश छान्नुहोस्',
        'Shop': 'पसल',
        'Owner': 'मालिक',
        'Login/Register': 'लगइन/दर्ता',
        'Contact Us': 'हामीलाई सम्पर्क गर्नुहोस',
        'Add to Cart': 'झोलामा थप्नुहोस्',
        'Cart': 'झोला',
        'Categories': 'कोटिहरू',
        'Mens': 'पुरुष',
        'Women': 'महिला',
        'Fragrances': 'सुगन्ध',
        'Beauty & Self Care': 'सौन्दर्य र आत्म-हेरचाह',
        'Special Offers': 'विशेष अफरहरू',
        'Checkout': 'चेकआउट',
        'Continue Shopping': 'किनमेल जारी राख्नुहोस्',
        'Coming Soon.....': 'चाँडै आउँदैछ.....'
    },
    'Malaysian': {
        'Select Country': 'Pilih Negara',
        'Shop': 'Kedai',
        'Owner': 'Pemilik',
        'Login/Register': 'Log Masuk/Daftar',
        'Contact Us': 'Hubungi Kami',
        'Add to Cart': 'Tambah ke Troli',
        'Cart': 'Troli',
        'Categories': 'Kategori',
        'Mens': 'Lelaki',
        'Women': 'Wanita',
        'Fragrances': 'Haruman',
        'Beauty & Self Care': 'Kecantikan & Penjagaan Diri',
        'Special Offers': 'Tawaran Istimewa',
        'Checkout': 'Pembayaran',
        'Continue Shopping': 'Teruskan Membeli-belah',
        'Coming Soon.....': 'Akan Datang.....'
    },
    'Indonesian': {
        'Select Country': 'Pilih Negara',
        'Shop': 'Toko',
        'Owner': 'Pemilik',
        'Login/Register': 'Masuk/Daftar',
        'Contact Us': 'Hubungi Kami',
        'Add to Cart': 'Tambah ke Keranjang',
        'Cart': 'Keranjang',
        'Categories': 'Kategori',
        'Mens': 'Pria',
        'Women': 'Wanita',
        'Fragrances': 'Wewangian',
        'Beauty & Self Care': 'Kecantikan & Perawatan Diri',
        'Special Offers': 'Penawaran Khusus',
        'Checkout': 'Pembayaran',
        'Continue Shopping': 'Lanjutkan Belanja',
        'Coming Soon.....': 'Segera Hadir.....'
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('English');

    useEffect(() => {
        if (language === 'Urdu') {
            document.body.classList.add('lang-urdu');
            document.body.setAttribute('dir', 'rtl');
        } else if (language === 'Arabic') {
            document.body.classList.remove('lang-urdu');
            document.body.setAttribute('dir', 'rtl');
        } else {
            document.body.classList.remove('lang-urdu');
            document.body.setAttribute('dir', 'ltr');
        }
    }, [language]);

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useTranslation must be used within LanguageProvider');
    return context;
};
