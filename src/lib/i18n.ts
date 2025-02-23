import {I18n} from '@aws-amplify/core';

import { translations } from '@aws-amplify/ui-react';
I18n.putVocabularies(translations);
I18n.setLanguage('tr');

const extraTranslations = {
  tr: {
    'Invalid verification code provided, please try again.': "Geçersiz doğrulama kodu girdiniz, lütfen tekrar deneyin.",
  },
};

I18n.putVocabulariesForLanguage('tr', extraTranslations.tr);
I18n.setLanguage('tr'); 