export function getFastIOContent() {
  return `
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.StringTokenizer;

public class FastIO {
    public static BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    public static PrintWriter pw = new PrintWriter(System.out);
    public static StringTokenizer st = null;

    public static int[] readInts(int numOfInput) throws IOException {
        st = new StringTokenizer(br.readLine());
        int[] inputs = new int[numOfInput];
        for (int i = 0; i < numOfInput; i++) {
            inputs[i] = Integer.parseInt(st.nextToken());
        }
        return inputs;
    }

    public static int readInt() throws Exception {
        return Integer.parseInt(br.readLine());
    }

    public static String readString() throws Exception {
        return (br.readLine());
    }

    public static void writeLn(Object str) throws Exception {
        pw.println(str);
    }

    public static void write(Object str) throws Exception {
        pw.print(str);
    }

    public static void close() {
        pw.close();
    }
}
  `;
}
