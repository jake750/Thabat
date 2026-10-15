package tn.thabat.app;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import java.io.File;
import java.io.FileNotFoundException;

/** 3.48: gives the system installer read access to the downloaded update (cache/upd/Thabat.apk) and nothing else.
 *  Not exported; access is granted per intent (FLAG_GRANT_READ_URI_PERMISSION). */
public class ApkProvider extends ContentProvider {
    static final String AUTH = "tn.thabat.app.apk";

    @Override public boolean onCreate() { return true; }

    File f() { return ApkUpd.file(getContext()); }

    @Override public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        if (!"/Thabat.apk".equals(uri.getPath()) || !"r".equals(mode)) throw new FileNotFoundException();
        return ParcelFileDescriptor.open(f(), ParcelFileDescriptor.MODE_READ_ONLY);
    }

    @Override public String getType(Uri uri) { return "application/vnd.android.package-archive"; }

    @Override public Cursor query(Uri uri, String[] proj, String sel, String[] args, String sort) {
        if (!"/Thabat.apk".equals(uri.getPath())) return null;
        MatrixCursor c = new MatrixCursor(new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE});
        c.addRow(new Object[]{"Thabat.apk", f().length()});
        return c;
    }

    @Override public Uri insert(Uri uri, ContentValues v) { return null; }
    @Override public int delete(Uri uri, String s, String[] a) { return 0; }
    @Override public int update(Uri uri, ContentValues v, String s, String[] a) { return 0; }
}
