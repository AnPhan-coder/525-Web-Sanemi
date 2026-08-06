package vn.edu.stu.Sanemi.Service;

import org.springframework.stereotype.Service;
import java.io.BufferedInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class TTSService {

    public String generateVoiceFromText(String text, String outputMp3Path, String langCode) throws Exception {
        List<String> chunks = splitTextIntoChunks(text, 150);
        
        try (FileOutputStream fos = new FileOutputStream(outputMp3Path)) {
            for (String chunk : chunks) {
                String encodedText = URLEncoder.encode(chunk, StandardCharsets.UTF_8.toString());
                String ttsUrl = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" + langCode + "&q=" + encodedText;
                
                URL url = new URL(ttsUrl);
                URLConnection conn = url.openConnection();
                conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
                
                try (InputStream in = new BufferedInputStream(conn.getInputStream())) {
                    byte[] dataBuffer = new byte[4096];
                    int bytesRead;
                    while ((bytesRead = in.read(dataBuffer, 0, 4096)) != -1) {
                        fos.write(dataBuffer, 0, bytesRead);
                    }
                }
                // Sleep slightly to avoid being blocked by Google rate-limiting
                Thread.sleep(300);
            }
        }
        return outputMp3Path;
    }

    private List<String> splitTextIntoChunks(String text, int maxLen) {
        List<String> result = new ArrayList<>();
        if (text == null || text.trim().isEmpty()) {
            return result;
        }
        
        String[] sentences = text.split("(?<=[.!?])\\s+");
        for (String sentence : sentences) {
            if (sentence.length() <= maxLen) {
                result.add(sentence);
            } else {
                String[] parts = sentence.split("(?<=,)\\s+");
                StringBuilder currentChunk = new StringBuilder();
                for (String part : parts) {
                    if (currentChunk.length() + part.length() > maxLen) {
                        if (currentChunk.length() > 0) {
                            result.add(currentChunk.toString().trim());
                            currentChunk = new StringBuilder();
                        }
                    }
                    currentChunk.append(part).append(" ");
                }
                if (currentChunk.length() > 0) {
                    result.add(currentChunk.toString().trim());
                }
            }
        }
        return result;
    }
}
