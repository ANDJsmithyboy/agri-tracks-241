package com.poufa.app.ui.traceability

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.FlashOff
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.Keyboard
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.RoundRect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathOperation
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.Executors

private const val TAG = "PoufaQrScanner"

/**
 * Scanner de QR code natif CameraX + ML Kit embarqué (100% hors ligne).
 * Conçu pour les conditions de terrain (faible luminosité avec torche, détection rapide).
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QrScannerScreen(
    onBack: () -> Unit,
    onCodeScanned: (String) -> Unit,
    onManualEntry: () -> Unit,
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
    ) { granted ->
        hasCameraPermission = granted
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    var cameraControl by remember { mutableStateOf<CameraControl?>(null) }
    var isTorchOn by remember { mutableStateOf(false) }
    var hasScanned by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Scanner un lot POUFA", fontSize = 18.sp, fontWeight = FontWeight.SemiBold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Retour")
                    }
                },
                actions = {
                    if (hasCameraPermission) {
                        IconButton(onClick = {
                            val nextTorch = !isTorchOn
                            cameraControl?.enableTorch(nextTorch)
                            isTorchOn = nextTorch
                        }) {
                            Icon(
                                if (isTorchOn) Icons.Filled.FlashOn else Icons.Filled.FlashOff,
                                contentDescription = if (isTorchOn) "Éteindre la torche" else "Allumer la torche",
                                tint = if (isTorchOn) Color(0xFFFBBF24) else MaterialTheme.colorScheme.onSurface,
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
                ),
            )
        },
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color.Black),
        ) {
            if (hasCameraPermission) {
                // Aperçu CameraX natif
                AndroidView(
                    factory = { ctx ->
                        val previewView = PreviewView(ctx).apply {
                            scaleType = PreviewView.ScaleType.FILL_CENTER
                        }
                        val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                        val analysisExecutor = Executors.newSingleThreadExecutor()

                        val barcodeScanner = BarcodeScanning.getClient(
                            BarcodeScannerOptions.Builder()
                                .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                                .build()
                        )

                        cameraProviderFuture.addListener({
                            val cameraProvider = cameraProviderFuture.get()

                            val preview = Preview.Builder().build().also {
                                it.surfaceProvider = previewView.surfaceProvider
                            }

                            val imageAnalysis = ImageAnalysis.Builder()
                                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                                .build()

                            imageAnalysis.setAnalyzer(analysisExecutor) { imageProxy ->
                                val mediaImage = imageProxy.image
                                if (mediaImage != null && !hasScanned) {
                                    val image = InputImage.fromMediaImage(
                                        mediaImage,
                                        imageProxy.imageInfo.rotationDegrees,
                                    )
                                    barcodeScanner.process(image)
                                        .addOnSuccessListener { barcodes ->
                                            if (!hasScanned && barcodes.isNotEmpty()) {
                                                val raw = barcodes.firstOrNull()?.rawValue
                                                if (!raw.isNullOrBlank()) {
                                                    hasScanned = true
                                                    val normalized = normalizeLotCode(raw)
                                                    Log.i(TAG, "QR Code détecté : $raw -> $normalized")
                                                    onCodeScanned(normalized)
                                                }
                                            }
                                        }
                                        .addOnFailureListener { exc ->
                                            Log.w(TAG, "Erreur analyse QR : ${exc.message}")
                                        }
                                        .addOnCompleteListener {
                                            imageProxy.close()
                                        }
                                } else {
                                    imageProxy.close()
                                }
                            }

                            try {
                                cameraProvider.unbindAll()
                                val cam = cameraProvider.bindToLifecycle(
                                    lifecycleOwner,
                                    CameraSelector.DEFAULT_BACK_CAMERA,
                                    preview,
                                    imageAnalysis,
                                )
                                cameraControl = cam.cameraControl
                            } catch (e: Exception) {
                                Log.e(TAG, "Échec d'initialisation CameraX : ${e.message}", e)
                            }
                        }, ContextCompat.getMainExecutor(ctx))

                        previewView
                    },
                    modifier = Modifier.fillMaxSize(),
                )

                // Viseur graphique avec masque semi-transparent
                QrViewfinderOverlay(
                    modifier = Modifier.fillMaxSize(),
                    primaryColor = MaterialTheme.colorScheme.primary,
                )

                // Consignes et raccourcis en bas d'écran
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .padding(horizontal = 24.dp, vertical = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Surface(
                        color = Color.Black.copy(alpha = 0.65f),
                        shape = RoundedCornerShape(12.dp),
                    ) {
                        Text(
                            text = "Alignez le QR code POUFA au centre du cadre",
                            color = Color.White,
                            fontSize = 13.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        )
                    }

                    Spacer(Modifier.height(16.dp))

                    OutlinedButton(
                        onClick = onManualEntry,
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = Color.Black.copy(alpha = 0.5f),
                            contentColor = Color.White,
                        ),
                        border = ButtonDefaults.outlinedButtonBorder.copy(
                            brush = androidx.compose.ui.graphics.SolidColor(Color.White.copy(alpha = 0.6f)),
                        ),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth(0.85f),
                    ) {
                        Icon(Icons.Filled.Keyboard, contentDescription = null, Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Saisir le numéro manuellement", fontSize = 14.sp)
                    }
                }
            } else {
                // Écran de demande de permission caméra pédagogique
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                ) {
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            Icons.Filled.QrCodeScanner,
                            contentDescription = null,
                            modifier = Modifier.size(36.dp),
                            tint = MaterialTheme.colorScheme.primary,
                        )
                    }
                    Spacer(Modifier.height(20.dp))
                    Text(
                        text = "Autorisation de la caméra requise",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        textAlign = TextAlign.Center,
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = "Pour scanner les étiquettes de lots avicoles sur le terrain, POUFA a besoin d'accéder à l'appareil photo.",
                        fontSize = 13.sp,
                        color = Color.White.copy(alpha = 0.75f),
                        textAlign = TextAlign.Center,
                        lineHeight = 18.sp,
                    )
                    Spacer(Modifier.height(24.dp))
                    Button(
                        onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) },
                        shape = RoundedCornerShape(12.dp),
                    ) {
                        Text("Activer la caméra")
                    }
                    Spacer(Modifier.height(12.dp))
                    TextButton(onClick = onManualEntry) {
                        Text("Saisir manuellement sans caméra", color = Color.White.copy(alpha = 0.9f))
                    }
                }
            }
        }
    }
}

/**
 * Viseur avec masque semi-transparent et 4 coins de visée découpés au laser.
 */
@Composable
private fun QrViewfinderOverlay(
    modifier: Modifier = Modifier,
    primaryColor: Color = Color(0xFF245747),
) {
    Canvas(modifier = modifier) {
        val boxSize = 260.dp.toPx()
        val left = (size.width - boxSize) / 2f
        val top = (size.height - boxSize) / 2.4f
        val cornerRadius = 20.dp.toPx()
        val cornerLength = 36.dp.toPx()
        val strokeWidth = 4.dp.toPx()

        // 1. Masque sombre transparent avec trou central
        val fullRect = Path().apply { addRect(Rect(0f, 0f, size.width, size.height)) }
        val windowRect = Path().apply {
            addRoundRect(
                RoundRect(
                    left = left,
                    top = top,
                    right = left + boxSize,
                    bottom = top + boxSize,
                    radiusX = cornerRadius,
                    radiusY = cornerRadius,
                )
            )
        }
        val overlayPath = Path.combine(PathOperation.Difference, fullRect, windowRect)
        drawPath(overlayPath, color = Color.Black.copy(alpha = 0.55f))

        // 2. Coins de cadrage
        // Haut-Gauche
        drawLine(primaryColor, Offset(left - 2, top + cornerLength), Offset(left - 2, top + cornerRadius), strokeWidth)
        drawLine(primaryColor, Offset(left + cornerRadius, top - 2), Offset(left + cornerLength, top - 2), strokeWidth)
        // Haut-Droite
        drawLine(primaryColor, Offset(left + boxSize + 2, top + cornerLength), Offset(left + boxSize + 2, top + cornerRadius), strokeWidth)
        drawLine(primaryColor, Offset(left + boxSize - cornerLength, top - 2), Offset(left + boxSize - cornerRadius, top - 2), strokeWidth)
        // Bas-Gauche
        drawLine(primaryColor, Offset(left - 2, top + boxSize - cornerLength), Offset(left - 2, top + boxSize - cornerRadius), strokeWidth)
        drawLine(primaryColor, Offset(left + cornerRadius, top + boxSize + 2), Offset(left + cornerLength, top + boxSize + 2), strokeWidth)
        // Bas-Droite
        drawLine(primaryColor, Offset(left + boxSize + 2, top + boxSize - cornerLength), Offset(left + boxSize + 2, top + boxSize - cornerRadius), strokeWidth)
        drawLine(primaryColor, Offset(left + boxSize - cornerLength, top + boxSize + 2), Offset(left + boxSize - cornerRadius, top + boxSize + 2), strokeWidth)
    }
}

/**
 * Normalise la chaîne scannée vers le code lot pur (ex: "POUFA-LOT:LP-003-01" -> "LP-003-01").
 */
private fun normalizeLotCode(raw: String): String {
    val trimmed = raw.trim()
    return when {
        trimmed.startsWith("POUFA-LOT:", ignoreCase = true) -> trimmed.substringAfter("POUFA-LOT:").trim()
        trimmed.contains("/lot/", ignoreCase = true) -> trimmed.substringAfterLast("/").trim()
        else -> trimmed
    }
}
