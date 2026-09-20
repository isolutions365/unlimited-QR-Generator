import json

corrections = {
    "en": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "The T:WPA value is widely recognized for WPA and WPA2 Personal networks. Some devices may also accept it with WPA2/WPA3 transition-mode networks, but the payload value alone does not guarantee compatibility with WPA3-SAE-only networks. Support depends on the scanning application, operating system, and network configuration. Also supports legacy WEP (T:WEP) and Open unencrypted networks (T:nopass).",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "The T:WPA value is widely recognized for WPA and WPA2 Personal networks. Some devices may also accept it with WPA2/WPA3 transition-mode networks, but the payload value alone does not guarantee compatibility with WPA3-SAE-only networks. Support depends on the scanning application, operating system, and network configuration.",
        "seo.landing.wifi-qr-generator.faqs.4.a": "The T:WPA value is widely recognized for WPA and WPA2 Personal networks. Some devices may also accept it with WPA2/WPA3 transition-mode networks, but the payload value alone does not guarantee compatibility with WPA3-SAE-only networks. Support depends on the scanning application, operating system, and network configuration."
    },
    "ar": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "تُعرف قيمة T:WPA لشبكات WPA و WPA2 Personal وتدعم بعض الأجهزة في الوضع الانتقالي WPA2/WPA3، دون ضمان التوافق مع شبكات WPA3-SAE فقط، كما تدعم WEP القديمة (T:WEP) والشبكات المفتوحة (T:nopass).",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "تُعرف قيمة T:WPA على نطاق واسع لشبكات WPA و WPA2 Personal. قد تقبلها بعض الأجهزة أيضاً مع شبكات الوضع الانتقالي WPA2/WPA3، لكن قيمة الحمولة وحدها لا تضمن التوافق مع شبكات WPA3-SAE فقط. يعتمد الدعم على تطبيق المسح الضوئي ونظام التشغيل وتكوين الشبكة.",
        "seo.landing.wifi-qr-generator.faqs.4.a": "تُعرف قيمة T:WPA على نطاق واسع لشبكات WPA و WPA2 Personal. قد تقبلها بعض الأجهزة أيضاً مع شبكات الوضع الانتقالي WPA2/WPA3، لكن قيمة الحمولة وحدها لا تضمن التوافق مع شبكات WPA3-SAE فقط. يعتمد الدعم على تطبيق المسح ونظام التشغيل وإعدادات الشبكة."
    },
    "ur": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "ویلیو T:WPA کو WPA اور WPA2 پرسنل کے لیے تسلیم کیا جاتا ہے اور کچھ آلات ٹرانزیشن موڈ قبول کرتے ہیں، لیکن خالص WPA3-SAE کی ضمانت نہیں ہے۔ نیز پرانے WEP (T:WEP) اور اوپن نیٹ ورکس (T:nopass) کو بھی سپورٹ کرتا ہے۔",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "ویلیو T:WPA بڑے پیمانے پر WPA اور WPA2 پرسنل نیٹ ورکس کے لیے تسلیم کی جاتی ہے۔ کچھ آلات اسے WPA2/WPA3 ٹرانزیشن موڈ نیٹ ورکس کے ساتھ بھی قبول کر سکتے ہیں، لیکن صرف پے لوڈ ویلیو خالص WPA3-SAE نیٹ ورکس کے ساتھ مطابقت کی ضمانت نہیں دیتی۔ سپورٹ کا انحصار اسکیننگ ایپلی کیشن، آپریٹنگ سسٹم اور نیٹ ورک کنفیگریشن پر ہے۔",
        "seo.landing.wifi-qr-generator.faqs.4.a": "ویلیو T:WPA بڑے پیمانے پر WPA اور WPA2 پرسنل نیٹ ورکس کے لیے تسلیم کی جاتی ہے۔ کچھ آلات اسے WPA2/WPA3 ٹرانزیشن موڈ نیٹ ورکس کے ساتھ بھی قبول کر سکتے ہیں، لیکن صرف پے لوڈ ویلیو خالص WPA3-SAE نیٹ ورکس کے ساتھ مطابقت کی ضمانت نہیں دیتی۔ سپورٹ کا انحصار اسکیننگ ایپلی کیشن، آپریٹنگ سسٹم اور نیٹ ورک کنفیگریشن پر ہے۔"
    },
    "de": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "Der Wert T:WPA wird für WPA/WPA2 Personal anerkannt und auf einigen Geräten im WPA2/WPA3-Übergangsmodus akzeptiert, garantiert jedoch keine reine WPA3-SAE-Kompatibilität. Unterstützt auch WEP (T:WEP) und offene Netzwerke (T:nopass).",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "Der Wert T:WPA ist für WPA- und WPA2-Personal-Netzwerke weithin anerkannt. Einige Geräte akzeptieren ihn auch bei Netzwerken im WPA2/WPA3-Übergangsmodus, der Payload-Wert allein garantiert jedoch keine Kompatibilität mit reinen WPA3-SAE-Netzwerken. Die Unterstützung hängt von der Scan-App, dem Betriebssystem und der Netzwerkkonfiguration ab.",
        "seo.landing.wifi-qr-generator.faqs.4.a": "Der Wert T:WPA ist für WPA- und WPA2-Personal-Netzwerke weithin anerkannt. Einige Geräte akzeptieren ihn auch bei Netzwerken im WPA2/WPA3-Übergangsmodus, der Payload-Wert allein garantiert jedoch keine Kompatibilität mit reinen WPA3-SAE-Netzwerken. Die Unterstützung hängt von der Scan-App, dem Betriebssystem und der Netzwerkkonfiguration ab."
    },
    "es": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "El valor T:WPA es ampliamente reconocido para redes WPA y WPA2 Personal y algunos dispositivos lo aceptan en modo de transición WPA2/WPA3, pero no garantiza compatibilidad con redes exclusivas WPA3-SAE. También admite WEP heredado (T:WEP) y redes abiertas (T:nopass).",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "El valor T:WPA es ampliamente reconocido para redes WPA y WPA2 Personal. Algunos dispositivos también pueden aceptarlo en redes con modo de transición WPA2/WPA3, pero el valor de la carga útil por sí solo no garantiza la compatibilidad con redes exclusivas WPA3-SAE. El soporte depende de la aplicación de escaneo, el sistema operativo y la configuración de red.",
        "seo.landing.wifi-qr-generator.faqs.4.a": "El valor T:WPA es ampliamente reconocido para redes WPA y WPA2 Personal. Algunos dispositivos también pueden aceptarlo en redes con modo de transición WPA2/WPA3, pero el valor de la carga útil por sí solo no garantiza la compatibilidad con redes exclusivas WPA3-SAE. El soporte depende de la aplicación de escaneo, el sistema operativo y la configuración de red."
    },
    "fr": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "La valeur T:WPA est largement reconnue pour WPA et WPA2 Personal et acceptée par certains appareils en mode de transition WPA2/WPA3, sans garantir la compatibilité avec les réseaux WPA3-SAE purs. Prend également en charge WEP (T:WEP) et les réseaux ouverts (T:nopass).",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "La valeur T:WPA est largement reconnue pour les réseaux WPA et WPA2 Personal. Certains appareils peuvent également l'accepter sur des réseaux en mode de transition WPA2/WPA3, mais la valeur de la charge utile ne garantit pas à elle seule la compatibilité avec les réseaux WPA3-SAE purs. La prise en charge dépend de l'application de numérisation, du système d'exploitation et de la configuration du réseau.",
        "seo.landing.wifi-qr-generator.faqs.4.a": "La valeur T:WPA est largement reconnue pour les réseaux WPA et WPA2 Personal. Certains appareils peuvent également l'accepter sur des réseaux en mode de transition WPA2/WPA3, mais la valeur de la charge utile ne garantit pas à elle seule la compatibilité avec les réseaux WPA3-SAE purs. La prise en charge dépend de l'application de numérisation, du système d'exploitation et de la configuration du réseau."
    },
    "pt": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "O valor T:WPA é amplamente reconhecido para redes WPA e WPA2 Personal e aceito em modo de transição WPA2/WPA3 em alguns aparelhos, sem garantia de compatibilidade com redes exclusivas WPA3-SAE. Também suporta WEP legado (T:WEP) e redes abertas (T:nopass).",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "O valor T:WPA é amplamente reconhecido para redes WPA e WPA2 Personal. Alguns dispositivos também podem aceitá-lo em redes no modo de transição WPA2/WPA3, mas o valor do payload por si só não garante compatibilidade com redes exclusivas WPA3-SAE. O suporte depende do aplicativo de leitura, do sistema operacional e da configuração da rede.",
        "seo.landing.wifi-qr-generator.faqs.4.a": "O valor T:WPA é amplamente reconhecido para redes WPA e WPA2 Personal. Alguns dispositivos também podem aceitá-lo em redes no modo de transição WPA2/WPA3, mas o valor do payload por si só não garante compatibilidade com redes exclusivas WPA3-SAE. O suporte depende do aplicativo de leitura, do sistema operacional e da configuração da rede."
    },
    "it": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "Il valore T:WPA è ampiamente riconosciuto per reti WPA e WPA2 Personal e accettato in modalità di transizione WPA2/WPA3 su alcuni dispositivi, senza garantire la compatibilità con reti solo WPA3-SAE. Supporta inoltre WEP legacy (T:WEP) e reti aperte (T:nopass).",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "Il valore T:WPA è ampiamente riconosciuto per le reti WPA e WPA2 Personal. Alcuni dispositivi possono accettarlo anche con reti in modalità di transizione WPA2/WPA3, ma il valore del payload da solo non garantisce la compatibilità con le reti solo WPA3-SAE. Il supporto dipende dall'applicazione di scansione, dal sistema operativo e dalla configurazione di rete.",
        "seo.landing.wifi-qr-generator.faqs.4.a": "Il valore T:WPA è ampiamente riconosciuto per le reti WPA e WPA2 Personal. Alcuni dispositivi possono accettarlo anche con reti in modalità di transizione WPA2/WPA3, ma il valore del payload da solo non garantisce la compatibilità con le reti solo WPA3-SAE. Il supporto dipende dall'applicazione di scansione, dal sistema operativo e dalla configurazione di rete."
    },
    "tr": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "T:WPA değeri WPA ve WPA2 Personal ağları için tanınır ve bazı cihazlarda WPA2/WPA3 geçiş modunda kabul edilir, ancak yalnızca WPA3-SAE olan ağlar için garanti vermez. Ayrıca eski WEP (T:WEP) ve Açık ağları (T:nopass) destekler.",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "T:WPA değeri WPA ve WPA2 Personal ağları için yaygın olarak tanınır. Bazı cihazlar bunu WPA2/WPA3 geçiş modu ağlarıyla da kabul edebilir, ancak yük değeri tek başına yalnızca WPA3-SAE olan ağlarla uyumluluğu garanti etmez. Destek; tarama uygulamasına, işletim sistemine ve ağ yapılandırmasına bağlıdır.",
        "seo.landing.wifi-qr-generator.faqs.4.a": "T:WPA değeri WPA ve WPA2 Personal ağları için yaygın olarak tanınır. Bazı cihazlar bunu WPA2/WPA3 geçiş modu ağlarıyla da kabul edebilir, ancak yük değeri tek başına yalnızca WPA3-SAE olan ağlarla uyumluluğu garanti etmez. Destek; tarama uygulamasına, işletim sistemine ve ağ yapılandırmasına bağlıdır."
    },
    "id": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "Nilai T:WPA diakui luas untuk jaringan WPA dan WPA2 Personal serta diterima pada mode transisi WPA2/WPA3 di beberapa perangkat, tanpa menjamin kompatibilitas jaringan murni WPA3-SAE. Juga mendukung WEP lawas (T:WEP) dan jaringan Terbuka (T:nopass).",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "Nilai T:WPA diakui secara luas untuk jaringan WPA dan WPA2 Personal. Beberapa perangkat mungkin juga menerimanya pada jaringan mode transisi WPA2/WPA3, tetapi nilai muatan saja tidak menjamin kompatibilitas dengan jaringan khusus WPA3-SAE. Dukungan bergantung pada aplikasi pemindai, sistem operasi, dan konfigurasi jaringan.",
        "seo.landing.wifi-qr-generator.faqs.4.a": "Nilai T:WPA diakui secara luas untuk jaringan WPA dan WPA2 Personal. Beberapa perangkat mungkin juga menerimanya pada jaringan mode transisi WPA2/WPA3, tetapi nilai muatan saja tidak menjamin kompatibilitas dengan jaringan khusus WPA3-SAE. Dukungan bergantung pada aplikasi pemindai, sistem operasi, dan konfigurasi jaringan."
    },
    "hi": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "T:WPA मान WPA और WPA2 Personal के लिए व्यापक रूप से समर्थित है और कुछ डिवाइस इसे WPA2/WPA3 ट्रांज़िशन मोड में स्वीकार करते हैं, लेकिन यह शुद्ध WPA3-SAE की गारंटी नहीं देता। यह पुराने WEP (T:WEP) और ओपन नेटवर्क (T:nopass) को भी सपोर्ट करता है।",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "T:WPA मान WPA और WPA2 Personal नेटवर्क के लिए व्यापक रूप से मान्यता प्राप्त है। कुछ डिवाइस इसे WPA2/WPA3 ट्रांज़िशन-मोड नेटवर्क के साथ भी स्वीकार कर सकते हैं, लेकिन केवल पेलोड मान ही शुद्ध WPA3-SAE नेटवर्क के साथ अनुकूलता की गारंटी नहीं देता है। समर्थन स्कैनिंग एप्लिकेशन, ऑपरेटिंग सिस्टम और नेटवर्क कॉन्फ़िगरेशन पर निर्भर करता है।",
        "seo.landing.wifi-qr-generator.faqs.4.a": "T:WPA मान WPA और WPA2 Personal नेटवर्क के लिए व्यापक रूप से मान्यता प्राप्त है। कुछ डिवाइस इसे WPA2/WPA3 ट्रांज़िशन-मोड नेटवर्क के साथ भी स्वीकार कर सकते हैं, लेकिन केवल पेलोड मान ही शुद्ध WPA3-SAE नेटवर्क के साथ अनुकूलता की गारंटी नहीं देता है। समर्थन स्कैनिंग एप्लिकेशन, ऑपरेटिंग सिस्टम और नेटवर्क कॉन्फ़िगरेशन पर निर्भर करता है।"
    },
    "zh": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "T:WPA 值广泛适用于 WPA 和 WPA2 个人网络，并在部分设备上支持 WPA2/WPA3 过渡模式，但不保证纯 WPA3-SAE 网络兼容性。同时支持传统 WEP (T:WEP) 和开放未加密网络 (T:nopass)。",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "T:WPA 值广泛适用于 WPA 和 WPA2 个人网络。部分设备可能也支持将其用于 WPA2/WPA3 过渡模式网络，但仅凭该有效负载值并不能保证与纯 WPA3-SAE 网络的兼容性。具体支持取决于扫描应用程序、操作系统和网络配置。",
        "seo.landing.wifi-qr-generator.faqs.4.a": "T:WPA 值广泛适用于 WPA 和 WPA2 个人网络。部分设备可能也支持将其用于 WPA2/WPA3 过渡模式网络，但仅凭该有效负载值并不能保证与纯 WPA3-SAE 网络的兼容性。具体支持取决于扫描应用程序、操作系统和网络配置。"
    },
    "ja": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "T:WPA の値は WPA/WPA2 Personal で広く認知され一部の端末で WPA2/WPA3 移行モードにも対応しますが、WPA3-SAE 専用環境の互換性を保証するものではありません。従来の WEP (T:WEP) や暗号化なしの Open ネットワーク (T:nopass) もサポートします。",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "T:WPA の値は、WPA および WPA2 Personal ネットワークで広く認識されています。一部の端末では WPA2/WPA3 移行モードのネットワークでも受け入れられる場合がありますが、ペイロード値単体では WPA3-SAE 専用ネットワークとの互환性は保証されません。サポート状況はスキャンアプリ、OS、ネットワーク設定に依存します。",
        "seo.landing.wifi-qr-generator.faqs.4.a": "T:WPA の値は、WPA および WPA2 Personal ネットワークで広く認識されています。一部の端末では WPA2/WPA3 移行モードのネットワークでも受け入れられる場合がありますが、ペイロード値単体では WPA3-SAE 専用ネットワークとの互換性は保証されません。サポート状況はスキャンアプリ、OS、ネットワーク設定に依存します。"
    },
    "ko": {
        "seo.landing.wifi-qr-generator.benefits.items.1.desc": "T:WPA 값은 WPA 및 WPA2 Personal에 널리 인식되며 일부 기기에서 WPA2/WPA3 전환 모드를 지원하지만, 순수 WPA3-SAE 호환성을 보장하지는 않습니다. 레거시 WEP (T:WEP) 및 암호화되지 않은 공개 네트워크 (T:nopass)도 지원합니다.",
        "seo.landing.wifi-qr-generator.features.items.1.desc": "T:WPA 값은 WPA 및 WPA2 Personal 네트워크에서 널리 인식됩니다. 일부 기기에서는 WPA2/WPA3 전환 모드 네트워크에서도 이를 수용할 수 있지만, 페이로드 값 자체만으로 순수 WPA3-SAE 전용 네트워크와의 호환성을 보장하지는 않습니다. 지원 여부는 스캔 애플리케이션, 운영체제 및 네트워크 구성에 따라 달라집니다.",
        "seo.landing.wifi-qr-generator.faqs.4.a": "T:WPA 값은 WPA 및 WPA2 Personal 네트워크에서 널리 인식됩니다. 일부 기기에서는 WPA2/WPA3 전환 모드 네트워크에서도 이를 수용할 수 있지만, 페이로드 값 자체만으로 순수 WPA3-SAE 전용 네트워크와의 호환성을 보장하지는 않습니다. 지원 여부는 스캔 애플리케이션, 운영체제 및 네트워크 구성에 따라 달라집니다."
    }
}

count = 0
for loc, keys in corrections.items():
    p = f"src/locales/{loc}.json"
    with open(p, "r", encoding="utf-8") as f:
        d = json.load(f)
    for k, v in keys.items():
        if k in d:
            d[k] = v
            count += 1
    with open(p, "w", encoding="utf-8") as f:
        json.dump(d, f, indent=2, ensure_ascii=False)

print(f"Updated {count} keys across 14 locale json files.")
