window.MPK_CONFIG = {
  APP_NAME: "MPK-PMB Angkatan XXIX",
  CAMPUS: "Politeknik KP Bitung",
  SUPABASE_URL: "https://fplimalvdaedvxrzwqgl.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_kbvscQTZkxZyY6PnMHCG9Q_Clv-i1xu",
  SUPABASE_ANON_KEY: "",
  ALLOW_DEMO_LOGIN: true,
  AUTO_SYNC_SECONDS: 30
};

window.addEventListener('load', () => {
  if (!document.querySelector('script[data-mpk-enhancements]')) {
    const s = document.createElement('script');
    s.src = './enhancements.js?v=20260807-2126';
    s.dataset.mpkEnhancements = '1';
    s.defer = true;
    document.body.appendChild(s);
  }
});
