import {I18n} from '@aws-amplify/core';

const translations = {
  tr: {
    'Sign In': 'Giriş Yap',
    'Sign Up': 'Kayıt Ol',
    'Sign Out': 'Çıkış Yap',
    'Sign in': 'Giriş Yap',
    'Sign up': 'Kayıt Ol',
    'Email': 'E-posta',
    'Password': 'Şifre',
    'Confirm Password': 'Şifreyi Onayla',
    'Enter your Email': 'E-posta adresinizi girin',
    'Enter your Password': 'Şifrenizi girin',
    'Confirm a Code': 'Kodu Onaylayın',
    'Confirm Sign Up': 'Kaydı Onayla',
    'Back to Sign In': 'Girişe Dön',
    'Forgot your password?': 'Şifrenizi mi unuttunuz?',
    'Reset Password': 'Şifreyi Sıfırla',
    'Send Code': 'Kod Gönder',
    'Code': 'Kod',
    'New Password': 'Yeni Şifre',
    'Submit': 'Gönder',
    'Create Account': 'Hesap Oluştur',
  },
};

I18n.putVocabulariesForLanguage('tr', translations.tr);
I18n.setLanguage('tr'); 