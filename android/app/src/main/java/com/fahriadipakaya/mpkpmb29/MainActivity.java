package com.fahriadipakaya.mpkpmb29;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import java.io.File;
import java.io.IOException;

public class MainActivity extends Activity {
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private Uri cameraPhotoUri;
    private static final int FILE_CHOOSER_REQUEST = 1001;
    private static final String HOME = "https://fahriadipakaya-tech.github.io/mpkpmb-angkatan-29/";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePath, FileChooserParams fileChooserParams) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = filePath;
                cameraPhotoUri = null;

                Intent galleryIntent = new Intent(Intent.ACTION_GET_CONTENT);
                galleryIntent.addCategory(Intent.CATEGORY_OPENABLE);
                galleryIntent.setType("image/*");

                Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                if (cameraIntent.resolveActivity(getPackageManager()) != null) {
                    try {
                        File photoDir = new File(getCacheDir(), "camera");
                        if (!photoDir.exists()) photoDir.mkdirs();
                        File photoFile = File.createTempFile("mpkpmb_", ".jpg", photoDir);
                        cameraPhotoUri = FileProvider.getUriForFile(
                                MainActivity.this,
                                getPackageName() + ".fileprovider",
                                photoFile
                        );
                        cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraPhotoUri);
                        cameraIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    } catch (IOException e) {
                        cameraPhotoUri = null;
                        cameraIntent = null;
                    }
                } else {
                    cameraIntent = null;
                }

                try {
                    if (fileChooserParams != null && fileChooserParams.isCaptureEnabled() && cameraIntent != null) {
                        startActivityForResult(cameraIntent, FILE_CHOOSER_REQUEST);
                    } else {
                        Intent chooser = Intent.createChooser(galleryIntent, "Pilih Foto Taruna");
                        if (cameraIntent != null) chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{cameraIntent});
                        startActivityForResult(chooser, FILE_CHOOSER_REQUEST);
                    }
                    return true;
                } catch (Exception e) {
                    filePathCallback.onReceiveValue(null);
                    filePathCallback = null;
                    Toast.makeText(MainActivity.this, "Kamera/Galeri tidak dapat dibuka.", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
                    view.loadUrl(uri.toString());
                    return true;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Tidak ada aplikasi untuk membuka tautan ini.", Toast.LENGTH_SHORT).show();
                }
                return true;
            }
        });

        webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            } catch (Exception e) {
                Toast.makeText(this, "Unduhan akan dibuka melalui browser.", Toast.LENGTH_SHORT).show();
            }
        });

        if (savedInstanceState == null) webView.loadUrl(HOME);
        else webView.restoreState(savedInstanceState);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_CHOOSER_REQUEST || filePathCallback == null) return;

        Uri[] results = null;
        if (resultCode == RESULT_OK) {
            if (data != null && data.getClipData() != null) {
                int count = data.getClipData().getItemCount();
                results = new Uri[count];
                for (int i = 0; i < count; i++) results[i] = data.getClipData().getItemAt(i).getUri();
            } else if (data != null && data.getData() != null) {
                results = new Uri[]{data.getData()};
            } else if (cameraPhotoUri != null) {
                results = new Uri[]{cameraPhotoUri};
            }
        }

        filePathCallback.onReceiveValue(results);
        filePathCallback = null;
        cameraPhotoUri = null;
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
