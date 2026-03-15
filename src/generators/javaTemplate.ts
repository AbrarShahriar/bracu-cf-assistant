export function getJavaTemplate(label: string) {
  return `public class ${label} {
    public static void main(String[] args) throws Exception {
        
        // Solve problem here
        
        FastIO.close();
    }
}
`;
}
