package vn.edu.stu.Sanemi.Service;

import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class VideoProcessingService {

    public String mergeVoiceover(String inputVideoPath, String voiceoverMp3Path, String outputVideoPath) throws Exception {
        List<String> command = new ArrayList<>();
        command.add("ffmpeg");
        command.add("-i"); command.add(inputVideoPath);
        command.add("-i"); command.add(voiceoverMp3Path);
        command.add("-filter_complex");
        // sidechaincompress: [0:a] (video audio) is compressed when [1:a] (voiceover) is active.
        // threshold=0.1: compress when voice volume is active.
        // ratio=15: compress background music to be quiet during speaking.
        // attack=20, release=300: fast drop, smooth recovery to 100% volume when voice stops.
        command.add("[0:a][1:a]sidechaincompress=threshold=0.1:ratio=15:attack=20:release=300[bg];[bg][1:a]amix=inputs=2:duration=first[a]");
        command.add("-map"); command.add("0:v");
        command.add("-map"); command.add("[a]");
        command.add("-c:v"); command.add("copy"); // copy video stream directly without re-encoding
        command.add("-c:a"); command.add("aac");  // encode audio to AAC
        command.add("-y"); // overwrite output file if it exists
        command.add(outputVideoPath);

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        Process process = pb.start();

        // Read output stream to prevent process hang/deadlock
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            System.err.println("FFmpeg execution failed. Output:\n" + output);
            throw new RuntimeException("FFmpeg failed with exit code: " + exitCode + "\nOutput: " + output);
        }

        return outputVideoPath;
    }
}
