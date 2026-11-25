package com.raqeeb.app;

import android.content.Context;
import android.util.Log;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.util.Date;

public final class CrashLogger {
  private static final String TAG = "CrashLogger";

  private CrashLogger() {}

  public static void install(final Context context) {
    final Thread.UncaughtExceptionHandler previous = Thread.getDefaultUncaughtExceptionHandler();
    Thread.setDefaultUncaughtExceptionHandler(
        new Thread.UncaughtExceptionHandler() {
          @Override
          public void uncaughtException(Thread thread, Throwable throwable) {
            try {
              File file = new File(context.getFilesDir(), "crash.log");
              PrintWriter writer = new PrintWriter(new FileWriter(file, true));
              writer.println("=== " + new Date() + " | thread: " + thread.getName());
              throwable.printStackTrace(writer);
              writer.close();
            } catch (Throwable ignored) {
            }
            Log.e(TAG, "Uncaught exception", throwable);
            if (previous != null) {
              previous.uncaughtException(thread, throwable);
            }
          }
        });
  }
}
