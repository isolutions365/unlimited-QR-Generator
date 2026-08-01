import fs from 'fs';
import path from 'path';

const localeDir = './src/locales';

const extraTranslations = {
  'error.loadAnalyticsFailed': {
    en: 'Failed to load analytics data',
    ur: 'اینالیٹکس ڈیٹا لوڈ کرنے میں ناکامی',
    ar: 'فشل في تحميل بيانات التحليلات',
    es: 'Error al cargar los datos de analítica',
    fr: 'Échec du chargement des données d’analyse',
    de: 'Analysedaten konnten nicht geladen werden',
    hi: 'एनालिटिक्स डेटा लोड करने में विफल',
    id: 'Gagal memuat data analitik',
    it: 'Impossibile caricare i dati analitici',
    ja: '分析データの読み込みに失敗しました',
    ko: '분석 데이터를 로드하지 못했습니다',
    pt: 'Falha ao carregar dados de analítica',
    tr: 'Analiz verileri yüklenemedi',
    zh: '无法加载分析数据'
  },
  'error.signInToSave': {
    en: 'Please sign in to save QR projects to cloud',
    ur: 'کلاؤڈ میں کیو آر پروجیکٹس کو محفوظ کرنے کے لیے براہ کرم سائن ان کریں',
    ar: 'يرجى تسجيل الدخول لحفظ مشاريع QR في السحابة',
    es: 'Inicie sesión para guardar proyectos QR en la nube',
    fr: 'Veuillez vous connecter pour enregistrer les projets QR dans le cloud',
    de: 'Bitte melden Sie sich an, um QR-Projekte in der Cloud zu speichern',
    hi: 'क्लाउड पर क्यूआर प्रोजेक्ट सहेजने के लिए कृपया साइन इन करें',
    id: 'Silakan masuk untuk menyimpan proyek QR ke cloud',
    it: 'Accedi per salvare i progetti QR nel cloud',
    ja: 'QRプロジェクトをクラウドに保存するにはサインインしてください',
    ko: '클라우드에 QR 프로젝트를 저장하려면 로그인하세요',
    pt: 'Faça login para salvar projetos QR na nuvem',
    tr: 'QR projelerini buluta kaydetmek için lütfen giriş yapın',
    zh: '请先登录以将二维码项目保存至云端'
  },
  'error.saveFailed': {
    en: 'Failed to save QR project',
    ur: 'کیو آر پروجیکٹ محفوظ کرنے میں ناکامی',
    ar: 'فشل في حفظ مشروع QR',
    es: 'Error al guardar el proyecto QR',
    fr: 'Échec de l’enregistrement du projet QR',
    de: 'QR-Projekt konnte nicht gespeichert werden',
    hi: 'क्यूआर प्रोजेक्ट सहेजने में विफल',
    id: 'Gagal menyimpan proyek QR',
    it: 'Impossibile salvare il progetto QR',
    ja: 'QRプロジェクトの保存に失敗しました',
    ko: 'QR 프로젝트 저장 실패',
    pt: 'Falha ao salvar o projeto QR',
    tr: 'QR projesi kaydedilemedi',
    zh: '无法保存二维码项目'
  },
  'confirm.deletePreset': {
    en: 'Are you sure you want to delete this custom template?',
    ur: 'کیا آپ واقعی اس کسٹم ٹیمپلیٹ کو حذف کرنا چاہتے ہیں؟',
    ar: 'هل أنت تأكد من أنك تريد حذف هذا القالب المخصص؟',
    es: '¿Está seguro de que desea eliminar esta plantilla personalizada?',
    fr: 'Êtes-vous sûr de vouloir supprimer ce modèle personnalisé ?',
    de: 'Möchten Sie diese benutzerdefinierte Vorlage wirklich löschen?',
    hi: 'क्या आप वाकई इस कस्टम टेम्पलेट को हटाना चाहते हैं?',
    id: 'Apakah Anda yakin ingin menghapus templat kustom ini?',
    it: 'Sei sicuro di voler eliminare questo modello personalizzato?',
    ja: 'このカスタムテンプレートを削除してもよろしいですか？',
    ko: '이 사용자 지정 템플릿을 삭제하시겠습니까?',
    pt: 'Tem certeza de que deseja excluir este modelo personalizado?',
    tr: 'Bu özel şablonu silmek istediğinizden emin misiniz?',
    zh: '确定要删除此自定义模板吗？'
  },
  'error.removeFailed': {
    en: 'Failed to remove preset template',
    ur: 'ٹیمپلیٹ کو ہٹانے میں ناکامی',
    ar: 'فشل في إزالة القالب المسبق',
    es: 'Error al eliminar la plantilla preestablecida',
    fr: 'Échec de la suppression du modèle',
    de: 'Vorlage konnte nicht entfernt werden',
    hi: 'टेम्पलेट हटाने में विफल',
    id: 'Gagal menghapus templat preset',
    it: 'Impossibile rimuovere il modello',
    ja: 'テンプレートの削除に失敗しました',
    ko: '템플릿 삭제 실패',
    pt: 'Falha ao remover o modelo',
    tr: 'Hazır şablon kaldırılamadı',
    zh: '无法删除预设模板'
  },
  'error.updateFolderFailed': {
    en: 'Failed to update folder organization',
    ur: 'فولڈر کی ترتیب کو اپ ڈیٹ کرنے میں ناکامی',
    ar: 'فشل في تحديث تنظيم المجلد',
    es: 'Error al actualizar la organización de carpetas',
    fr: 'Échec de la mise à jour de l’organisation des dossiers',
    de: 'Ordnerorganisation konnte nicht aktualisiert werden',
    hi: 'फ़ोल्डर संगठन को अद्यतन करने में विफल',
    id: 'Gagal memperbarui organisasi folder',
    it: 'Impossibile aggiornare l’organizzazione delle cartelle',
    ja: 'フォルダ構造の更新に失敗しました',
    ko: '폴더 조직 업데이트 실패',
    pt: 'Falha ao atualizar a organização de pastas',
    tr: 'Klasör düzenlemesi güncellenemedi',
    zh: '无法更新文件夹分类'
  },
  'error.signInToSimulate': {
    en: 'Please sign in to test scan simulation',
    ur: 'اسکین سیمولیشن کا تجربہ کرنے کے لیے سائن ان کریں',
    ar: 'يرجى تسجيل الدخول لاختبار محاكاة المسح',
    es: 'Inicie sesión para probar la simulación de escaneo',
    fr: 'Veuillez vous connecter pour tester la simulation de scan',
    de: 'Bitte melden Sie sich an, um die Scan-Simulation zu testen',
    hi: 'स्कैन सिमुलेशन का परीक्षण करने के लिए कृपया साइन इन करें',
    id: 'Silakan masuk untuk menguji simulasi pemindaian',
    it: 'Accedi per testare la simulazione di scansione',
    ja: 'スキャンシミュレーションをテストするにはサインインしてください',
    ko: '스캔 시뮬레이션을 테스트하려면 로그인하세요',
    pt: 'Faça login para testar a simulação de escaneamento',
    tr: 'Tarama simülasyonunu test etmek için lütfen giriş yapın',
    zh: '请先登录以测试扫描模拟功能'
  },
  'error.seedFailed': {
    en: 'Failed to generate simulation scan clicks',
    ur: 'سیمولیشن اسکین کلکس بنانے میں ناکامی',
    ar: 'فشل في توليد نقرات المسح التجريبية',
    es: 'Error al generar clics de escaneo simulados',
    fr: 'Échec de la génération des clics de scan simulés',
    de: 'Simulierte Scan-Klicks konnten nicht generiert werden',
    hi: 'सिमुलेशन स्कैन क्लिक जनरेट करने में विफल',
    id: 'Gagal menghasilkan klik pemindaian simulasi',
    it: 'Impossibile generare clic di scansione simulati',
    ja: 'シミュレーションスキャンクリックの生成に失敗しました',
    ko: '시뮬레이션 스캔 클릭 생성 실패',
    pt: 'Falha ao gerar cliques de escaneamento simulados',
    tr: 'Simülasyon tarama tıklamaları oluşturulamadı',
    zh: '无法生成模拟扫描点击'
  },
  'confirm.clearAllScans': {
    en: 'Are you sure you want to clear all recorded scan history logs?',
    ur: 'کیا آپ واقعی تمام اسکین ہسٹری لاگز کو صاف کرنا چاہتے ہیں؟',
    ar: 'هل أنت تأكد من أنك تريد مسح جميع سجلات المسح المسجلة؟',
    es: '¿Está seguro de que desea borrar todo el historial de escaneos?',
    fr: 'Êtes-vous sûr de vouloir effacer tout l’historique des scans ?',
    de: 'Möchten Sie wirklich den gesamten aufgezeichneten Scan-Verlauf löschen?',
    hi: 'क्या आप वाकई सभी रिकॉर्ड किए गए स्कैन इतिहास लॉग को साफ़ करना चाहते हैं?',
    id: 'Apakah Anda yakin ingin menghapus semua log riwayat pemindaian?',
    it: 'Sei sicuro di voler cancellare tutto lo storico delle scansioni?',
    ja: '記録されたすべてのスキャン履歴ログを消去してもよろしいですか？',
    ko: '기록된 모든 스캔 기록 로그를 삭제하시겠습니까?',
    pt: 'Tem certeza de que deseja limpar todo o histórico de escaneamentos?',
    tr: 'Tüm kayıtlı tarama geçmişi günlüklerini temizlemek istediğinizden emin misiniz?',
    zh: '确定要清除所有已记录的扫描历史日志吗？'
  },
  'error.clearLogsFailed': {
    en: 'Failed to clear analytics logs',
    ur: 'اینالیٹکس لاگز کو صاف کرنے میں ناکامی',
    ar: 'فشل في مسح سجلات التحليلات',
    es: 'Error al borrar los registros de analítica',
    fr: 'Échec de l’effacement des journaux d’analyse',
    de: 'Analyselogs konnten nicht gelöscht werden',
    hi: 'एनालिटिक्स लॉग को साफ़ करने में विफल',
    id: 'Gagal menghapus log analitik',
    it: 'Impossibile cancellare i registri analitici',
    ja: '分析ログの消去に失敗しました',
    ko: '분석 로그 삭제 실패',
    pt: 'Falha ao limpar os registros de analítica',
    tr: 'Analiz günlükleri temizlenemedi',
    zh: '无法清除分析日志'
  },
  'error.downloadSuccessClaimSession': {
    en: 'QR code downloaded! Sign in to claim this code and track scan analytics.',
    ur: 'کیو آر کوڈ ڈاؤن لوڈ ہو گیا! اس کوڈ کی ملکیت حاصل کرنے اور اینالیٹکس دیکھنے کے لیے سائن ان کریں۔',
    ar: 'تم تنزيل رمز QR! قم بتسجيل الدخول لربط هذا الرمز وتتبع تحليلات المسح.',
    es: '¡Código QR descargado! Inicie sesión para vincular este código y rastrear analíticas.',
    fr: 'Code QR téléchargé ! Connectez-vous pour associer ce code et suivre les analyses.',
    de: 'QR-Code heruntergeladen! Melden Sie sich an, um diesen Code zu speichern.',
    hi: 'क्यूआर कोड डाउनलोड हो गया! इस कोड को क्लेम करने और एनालिटिक्स ट्रैक करने के लिए साइन इन करें।',
    id: 'Kode QR diunduh! Masuk untuk mengklaim kode ini dan melacak analitik.',
    it: 'Codice QR scaricato! Accedi per associare questo codice e tracciare le analisi.',
    ja: 'QRコードがダウンロードされました！サインインしてこのコードを自分のプロジェクトに保存しましょう。',
    ko: 'QR 코드가 다운로드되었습니다! 이 코드를 저장하고 스캔 분석을 추적하려면 로그인하세요.',
    pt: 'Código QR baixado! Faça login para reivindicar este código e rastrear analíticas.',
    tr: 'QR kodu indirildi! Bu kodu sahiplenmek ve tarama analizlerini izlemek için giriş yapın.',
    zh: '二维码已成功下载！登录以关联此二维码并追踪扫描数据。'
  },
  'auth.accessRestrictedDesc': {
    en: 'Please sign in to unlock custom logos, analytics tracking, and cloud project management.',
    ur: 'کسٹم لوگو، اینالیٹکس ٹریکنگ اور پروجیکٹ مینجمنٹ کو ان لاک کرنے کے لیے سائن ان کریں۔',
    ar: 'يرجى تسجيل الدخول لفتح الشعارات المخصصة وتتبع التحليلات وإدارة المشاريع.',
    es: 'Inicie sesión para desbloquear logotipos personalizados, analíticas y gestión de proyectos.',
    fr: 'Veuillez vous connecter pour débloquer les logos personnalisés et les analyses.',
    de: 'Bitte melden Sie sich an, um benutzerdefinierte Logos und Analysen freizuschalten.',
    hi: 'कस्टम लोगो, एनालिटिक्स ट्रैकिंग और प्रोजेक्ट प्रबंधन को अनलॉक करने के लिए कृपया साइन इन करें।',
    id: 'Silakan masuk untuk membuka logo kustom, pelacakan analitik, dan manajemen proyek.',
    it: 'Accedi per sbloccare loghi personalizzati, tracciamento delle analisi e gestione dei progetti.',
    ja: 'カスタムロゴ、分析追跡、クラウド管理の機能を利用するにはサインインしてください。',
    ko: '사용자 지정 로고, 분석 추적 및 클라우드 프로젝트 관리를 잠금 해제하려면 로그인하세요.',
    pt: 'Faça login para desbloquear logotipos personalizados e rastreamento de analíticas.',
    tr: 'Özel logolar, analiz takibi ve bulut proje yönetimini açmak için lütfen giriş yapın.',
    zh: '请先登录以解锁自定义 Logo、扫描数据追踪及云端项目管理。'
  },
  'auth.signInSignUpButton': {
    en: 'Sign In / Sign Up',
    ur: 'سائن ان / سائن اپ',
    ar: 'تسجيل الدخول / إنشاء حساب',
    es: 'Iniciar Sesión / Registrarse',
    fr: 'Connexion / Inscription',
    de: 'Anmelden / Registrieren',
    hi: 'साइन इन / साइन अप',
    id: 'Masuk / Daftar',
    it: 'Accedi / Registrati',
    ja: 'サインイン / 新規登録',
    ko: '로그인 / 회원가입',
    pt: 'Entrar / Cadastrar-se',
    tr: 'Giriş Yap / Kaydol',
    zh: '登录 / 注册'
  }
};

const locales = fs.readdirSync(localeDir).filter(f => f.endsWith('.json') && f !== 'coverage_report.json' && f !== '.translation_progress.json');

locales.forEach(file => {
  const code = file.replace('.json', '');
  const filePath = path.join(localeDir, file);
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let added = 0;

  Object.keys(extraTranslations).forEach(key => {
    if (!json[key]) {
      const valMap = extraTranslations[key];
      json[key] = valMap[code] || valMap['en'] || key;
      added++;
    }
  });

  if (added > 0) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    console.log(`Updated ${code}.json : added ${added} extra keys.`);
  }
});
