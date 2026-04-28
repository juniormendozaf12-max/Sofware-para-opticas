package com.centroopticosicuani.app;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.ParcelFileDescriptor;
import android.print.PageRange;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintDocumentInfo;
import android.print.PrintManager;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

@CapacitorPlugin(name = "PrintPdf")
public class PrintPlugin extends Plugin {

    @PluginMethod()
    public void print(PluginCall call) {
        String uriString = call.getString("uri");
        String jobName = call.getString("jobName", "Centro Optico Sicuani");

        if (uriString == null || uriString.isEmpty()) {
            call.reject("Missing 'uri' parameter");
            return;
        }

        getActivity().runOnUiThread(() -> {
            try {
                InputStream inputStream = null;

                // Try content:// URI first
                try {
                    Uri fileUri = Uri.parse(uriString);
                    inputStream = getContext().getContentResolver().openInputStream(fileUri);
                } catch (Exception ignored) {}

                // Fallback: try as file path
                if (inputStream == null) {
                    // Remove file:// prefix if present
                    String path = uriString;
                    if (path.startsWith("file://")) {
                        path = path.substring(7);
                    }
                    File file = new File(path);
                    if (file.exists()) {
                        inputStream = new FileInputStream(file);
                    }
                }

                if (inputStream == null) {
                    call.reject("Cannot open file: " + uriString);
                    return;
                }

                // Read PDF bytes
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buf = new byte[8192];
                int len;
                while ((len = inputStream.read(buf)) != -1) {
                    baos.write(buf, 0, len);
                }
                inputStream.close();
                final byte[] pdfBytes = baos.toByteArray();

                PrintManager printManager = (PrintManager) getContext()
                        .getSystemService(Context.PRINT_SERVICE);

                if (printManager == null) {
                    call.reject("PrintManager not available");
                    return;
                }

                PrintDocumentAdapter adapter = new PrintDocumentAdapter() {
                    @Override
                    public void onLayout(PrintAttributes oldAttrs,
                                         PrintAttributes newAttrs,
                                         CancellationSignal cancel,
                                         LayoutResultCallback callback,
                                         Bundle extras) {
                        if (cancel.isCanceled()) {
                            callback.onLayoutCancelled();
                            return;
                        }
                        PrintDocumentInfo info = new PrintDocumentInfo.Builder(jobName + ".pdf")
                                .setContentType(PrintDocumentInfo.CONTENT_TYPE_DOCUMENT)
                                .setPageCount(PrintDocumentInfo.PAGE_COUNT_UNKNOWN)
                                .build();
                        callback.onLayoutFinished(info, true);
                    }

                    @Override
                    public void onWrite(PageRange[] pages,
                                        ParcelFileDescriptor dest,
                                        CancellationSignal cancel,
                                        WriteResultCallback callback) {
                        try {
                            OutputStream out = new FileOutputStream(dest.getFileDescriptor());
                            out.write(pdfBytes);
                            out.close();
                            callback.onWriteFinished(new PageRange[]{PageRange.ALL_PAGES});
                        } catch (IOException e) {
                            callback.onWriteFailed(e.getMessage());
                        }
                    }
                };

                printManager.print(jobName, adapter, new PrintAttributes.Builder()
                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                        .build());

                call.resolve();
            } catch (Exception e) {
                call.reject("Print failed: " + e.getMessage(), e);
            }
        });
    }
}
