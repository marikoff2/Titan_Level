package ua.titan.level;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.content.ContentValues;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.widget.Toast;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Окно приложения: страница «Уровень станин X» из assets, работает без интернета. */
public class MainActivity extends Activity {

    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);      // здесь хранятся показания и сохранённые замеры
        s.setAllowFileAccess(true);
        s.setTextZoom(100);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri.toString().startsWith("file:///android_asset/")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) { }
                return true;
            }
        });

        web.addJavascriptInterface(new Bridge(), "TitanAndroid");
        setContentView(web);
        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("file:///android_asset/index.html");
    }

    /** Выгрузка замеров: файл в «Загрузки/TitanLevel», затем окно «Поделиться» (почта, мессенджер, Claude). */
    private class Bridge {
        @JavascriptInterface
        public void saveFile(String name, String text) {
            runOnUiThread(() -> {
                try {
                    byte[] data = text.getBytes(StandardCharsets.UTF_8);
                    Uri uri = null;
                    String where;
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentValues v = new ContentValues();
                        v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
                        v.put(MediaStore.MediaColumns.MIME_TYPE, "application/json");
                        v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/TitanLevel");
                        uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                        try (OutputStream os = getContentResolver().openOutputStream(uri)) { os.write(data); }
                        where = "Загрузки/TitanLevel/" + name;
                    } else {
                        File dir = new File(getExternalFilesDir(null), "TitanLevel");
                        dir.mkdirs();
                        File f = new File(dir, name);
                        try (FileOutputStream os = new FileOutputStream(f)) { os.write(data); }
                        where = f.getAbsolutePath();
                    }
                    Toast.makeText(MainActivity.this, "Сохранено: " + where, Toast.LENGTH_LONG).show();
                    Intent share = new Intent(Intent.ACTION_SEND);
                    share.putExtra(Intent.EXTRA_SUBJECT, name);
                    if (uri != null) {
                        share.setType("application/json");
                        share.putExtra(Intent.EXTRA_STREAM, uri);
                        share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    } else {
                        share.setType("text/plain");
                        share.putExtra(Intent.EXTRA_TEXT, text);
                    }
                    startActivity(Intent.createChooser(share, "Отправить замеры"));
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Не удалось сохранить: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        // «Назад» сначала сворачивает 3D с полного экрана, иначе — обычное поведение
        web.evaluateJavascript("(window.titanBack&&window.titanBack())?'1':'0'", r -> {
            if (r != null && r.contains("1")) return;
            if (web.canGoBack()) web.goBack();
            else MainActivity.super.onBackPressed();
        });
    }
}
