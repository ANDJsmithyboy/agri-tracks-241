package com.poufa.app.ui.ai

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poufa.app.ui.theme.GeistMono

/**
 * Render Markdown léger natif Compose — pas de WebView.
 * Supporte: **gras**, *italique*, `code inline`, ```blocs de code```,
 * titres #/##/###, listes à puces - et numérotées 1., --- séparateurs.
 */
@Composable
fun MarkdownText(
    markdown: String,
    modifier: Modifier = Modifier,
) {
    val blocks = remember(markdown) { parseMarkdownBlocks(markdown) }
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        for (block in blocks) {
            when (block) {
                is MdBlock.Heading -> {
                    val style = when (block.level) {
                        1 -> MaterialTheme.typography.titleLarge
                        2 -> MaterialTheme.typography.titleMedium
                        else -> MaterialTheme.typography.titleSmall
                    }
                    Text(
                        text = parseInlineMarkdown(block.text),
                        style = style,
                        modifier = Modifier.padding(top = 8.dp, bottom = 2.dp),
                    )
                }
                is MdBlock.Paragraph -> {
                    Text(
                        text = parseInlineMarkdown(block.text),
                        style = MaterialTheme.typography.bodyMedium,
                        lineHeight = 22.sp,
                    )
                }
                is MdBlock.CodeBlock -> {
                    Box(
                        Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(MaterialTheme.colorScheme.surfaceContainerHigh)
                            .horizontalScroll(rememberScrollState())
                            .padding(12.dp),
                    ) {
                        Text(
                            text = block.code,
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontFamily = GeistMono,
                                lineHeight = 18.sp,
                            ),
                            color = MaterialTheme.colorScheme.onSurface,
                        )
                    }
                }
                is MdBlock.BulletItem -> {
                    Row(modifier = Modifier.padding(start = 8.dp)) {
                        Text("•  ", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                        Text(
                            text = parseInlineMarkdown(block.text),
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.weight(1f),
                        )
                    }
                }
                is MdBlock.NumberedItem -> {
                    Row(modifier = Modifier.padding(start = 8.dp)) {
                        Text(
                            "${block.number}.  ",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium,
                        )
                        Text(
                            text = parseInlineMarkdown(block.text),
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.weight(1f),
                        )
                    }
                }
                is MdBlock.Divider -> {
                    HorizontalDivider(
                        modifier = Modifier.padding(vertical = 8.dp),
                        color = MaterialTheme.colorScheme.outlineVariant,
                    )
                }
            }
        }
    }
}

// ── Block-level parser ──────────────────────────────────────────────────

sealed class MdBlock {
    data class Heading(val level: Int, val text: String) : MdBlock()
    data class Paragraph(val text: String) : MdBlock()
    data class CodeBlock(val language: String, val code: String) : MdBlock()
    data class BulletItem(val text: String) : MdBlock()
    data class NumberedItem(val number: Int, val text: String) : MdBlock()
    data object Divider : MdBlock()
}

fun parseMarkdownBlocks(raw: String): List<MdBlock> {
    val lines = raw.lines()
    val blocks = mutableListOf<MdBlock>()
    var i = 0
    var paragraphBuf = StringBuilder()

    fun flushParagraph() {
        val text = paragraphBuf.toString().trim()
        if (text.isNotEmpty()) blocks.add(MdBlock.Paragraph(text))
        paragraphBuf = StringBuilder()
    }

    while (i < lines.size) {
        val line = lines[i]
        val trimmed = line.trim()

        // Fenced code block
        if (trimmed.startsWith("```")) {
            flushParagraph()
            val lang = trimmed.removePrefix("```").trim()
            val codeLines = mutableListOf<String>()
            i++
            while (i < lines.size && !lines[i].trim().startsWith("```")) {
                codeLines.add(lines[i])
                i++
            }
            blocks.add(MdBlock.CodeBlock(lang, codeLines.joinToString("\n")))
            i++ // skip closing ```
            continue
        }

        // Heading
        if (trimmed.startsWith("#")) {
            flushParagraph()
            val level = trimmed.takeWhile { it == '#' }.length.coerceAtMost(3)
            val text = trimmed.drop(level).trimStart()
            blocks.add(MdBlock.Heading(level, text))
            i++
            continue
        }

        // Divider
        if (trimmed.matches(Regex("^-{3,}$")) || trimmed.matches(Regex("^\\*{3,}$"))) {
            flushParagraph()
            blocks.add(MdBlock.Divider)
            i++
            continue
        }

        // Bullet
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            flushParagraph()
            blocks.add(MdBlock.BulletItem(trimmed.drop(2).trim()))
            i++
            continue
        }

        // Numbered list
        val numMatch = Regex("^(\\d+)\\.\\s+(.*)").matchEntire(trimmed)
        if (numMatch != null) {
            flushParagraph()
            blocks.add(MdBlock.NumberedItem(numMatch.groupValues[1].toInt(), numMatch.groupValues[2]))
            i++
            continue
        }

        // Empty line
        if (trimmed.isEmpty()) {
            flushParagraph()
            i++
            continue
        }

        // Regular text → accumulate paragraph
        if (paragraphBuf.isNotEmpty()) paragraphBuf.append(" ")
        paragraphBuf.append(trimmed)
        i++
    }
    flushParagraph()
    return blocks
}

// ── Inline parser — **bold**, *italic*, `code` ──────────────────────────

fun parseInlineMarkdown(text: String) = buildAnnotatedString {
    var i = 0
    while (i < text.length) {
        when {
            // Bold **text**
            i + 1 < text.length && text[i] == '*' && text[i + 1] == '*' -> {
                val end = text.indexOf("**", i + 2)
                if (end > 0) {
                    withStyle(SpanStyle(fontWeight = FontWeight.Bold)) {
                        append(text.substring(i + 2, end))
                    }
                    i = end + 2
                } else {
                    append(text[i])
                    i++
                }
            }
            // Italic *text*
            text[i] == '*' -> {
                val end = text.indexOf('*', i + 1)
                if (end > 0) {
                    withStyle(SpanStyle(fontStyle = FontStyle.Italic)) {
                        append(text.substring(i + 1, end))
                    }
                    i = end + 1
                } else {
                    append(text[i])
                    i++
                }
            }
            // Inline code `text`
            text[i] == '`' -> {
                val end = text.indexOf('`', i + 1)
                if (end > 0) {
                    withStyle(SpanStyle(fontFamily = FontFamily.Monospace, fontSize = 13.sp)) {
                        append(text.substring(i + 1, end))
                    }
                    i = end + 1
                } else {
                    append(text[i])
                    i++
                }
            }
            else -> {
                append(text[i])
                i++
            }
        }
    }
}

