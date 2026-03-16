export function getGenContent(startGenId: number) {
  return `
import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Stack;
import java.util.concurrent.ThreadLocalRandom;

public class Gen {
    public static void main(String[] args) throws FileNotFoundException {
        int testcases = 5;

        // Define Problem Parameters
        Parameter N = new Parameter("N", "1", "5");
        Parameter M = new Parameter("M", "0", "(N*(N-1))/2").dependsOn(N);

        Parameter U = new Parameter("U", "1", "N").dependsOn(N);
        Parameter V = new Parameter("V", "1", "N").dependsOn(N);
        Parameter W = new Parameter("W", "1", "10");

        // Register Parameters
        Generator.registerParams(N, M, U, V, W);

        for (int t = 0; t < testcases; t++) {
            // Create a new instance for each test case
            Generator gen = new Generator();

            // A single line containing N M such as 5 4
            gen.line(1, N, M);

            // M number of lines containing U V W such as 1 2 3
            gen.line("M", U, V, W);

            // Run Generator
            gen.run();
        }
    }
}

/*
 * --- !!!WARNING!!! ---
 * DO NOT EDIT ANYTHING BELOW
 * ...unless you know what you are doing
 */

class Generator {
    private static HashMap<String, Parameter> parametersMap = new HashMap<>();
    private HashMap<String, Long> valuesMap = new HashMap<>();
    private StringBuilder res = null;
    public static int genId = ${startGenId};

    public Generator() {
        this.res = new StringBuilder();
    }

    public static void registerParams(Parameter... parameters) {
        for (Parameter p : parameters) {
            parametersMap.put(p.name, p);
        }
    }

    public String getResult() {
        return res.toString();
    }

    public void generateValue(Parameter p) {
        if (p.hasDeps()) {
            ArrayList<Parameter> depParams = p.getDeps();
            depParams.forEach(depParam -> {
                if (valuesMap.containsKey(depParam.name)) {
                    Long val = p.generate(this);
                    valuesMap.put(p.name, val);
                } else {
                    throw new NullPointerException("Dependencies not generated: '" + depParam.name
                            + "' which is required for '" + p.name + "'");
                }
            });
        } else {
            Long val = p.generate(this);
            valuesMap.put(p.name, val);
        }

    }

    public void generateValues() {
        this.generateValues("all");
    }

    public void generateValues(String criteria) {
        if (criteria.equals("all")) {
            parametersMap.forEach((key, param) -> {
                generateValue(param);
            });
        } else if (criteria.equals("indep")) {
            parametersMap.forEach((key, param) -> {
                if (!param.hasDeps()) {
                    // for independent params
                    generateValue(param);
                }
            });
        } else if (criteria.equals("dep")) {
            parametersMap.forEach((key, param) -> {
                if (param.hasDeps()) {
                    // for dependent params
                    generateValue(param);
                }
            });
        }
    }

    public void line(int n, Parameter... params) {
        for (int i = 0; i < n; i++) {
            for (Parameter p : params) {
                generateValue(p);
                String valOfParam = valuesMap.get(p.name).toString();
                res.append(valOfParam + " ");
            }
            res.append("\\n");
        }
    }

    public void line(String n, Parameter... params) {
        if (!valuesMap.containsKey(n))
            throw new NullPointerException("Dependencies not generated: '" + n
                    + "' which is required for '" + params[0].name + "'");

        Long val = valuesMap.get(n);
        for (int i = 0; i < val; i++) {
            for (Parameter p : params) {
                generateValue(p);
                String valOfParam = valuesMap.get(p.name).toString();
                res.append(valOfParam + " ");
            }
            res.append("\\n");
        }
    }

    public void run() throws FileNotFoundException {
        int id = Generator.genId;
        File file = new File("tests/input" + (id) + ".txt");
        file.getParentFile().mkdirs();
        try (PrintWriter out = new PrintWriter(file)) {
            out.print(res.toString());
        }
        try (PrintWriter out = new PrintWriter("tests/expected" + (id) + ".txt")) {
            out.print("MANUAL_CHECK");
        }
        Generator.genId++;
    }

    public HashMap<String, Long> getValues() {
        return this.valuesMap;
    }

}

class Parameter {
    public String name = "";
    public String min = Long.MIN_VALUE + "";
    public String max = Long.MAX_VALUE + "";

    private ArrayList<Parameter> dependencies = null;

    public Parameter(String parameterName) {
        this.name = parameterName;
    }

    public Parameter(String parameterName, String min, String max) {
        this.name = parameterName;
        this.min = min;
        this.max = max;
    }

    public Parameter dependsOn(Parameter... params) {
        this.dependencies = new ArrayList<>(params.length);
        for (Parameter p : params) {
            this.dependencies.add(p);
        }
        return this;
    }

    public ArrayList<Parameter> getDeps() {
        return this.dependencies;
    }

    public boolean hasDeps() {
        return this.dependencies != null;
    }

    public long generate(Generator generator) {
        // System.out.println("generating " + this.name);
        HashMap<String, Long> valuesMap = generator.getValues();
        String minExpr = this.min, maxExpr = this.max;
        Long generatedMin = Long.MIN_VALUE, generatedMax = Long.MAX_VALUE;

        // Check for dependencies and generate min, max
        if (this.hasDeps()) {
            ArrayList<Parameter> deps = this.getDeps();
            // System.out.println("deps detected in " + this.name + " with size " +
            // deps.size());
            for (int i = 0; i < deps.size(); i++) {
                Parameter dep = deps.get(i);
                if (valuesMap.containsKey(dep.name)) {
                    // System.out.println(dep.name + " = " + valuesMap.get(dep.name) + " exists for
                    // " + this.name);
                    // Check whether dep is in min or max or both
                    try {
                        // System.out.println("min for " + this.name + " = " + minExpr);
                        minExpr = minExpr.replaceAll("\\\\b" + dep.name + "\\\\b", valuesMap.get(dep.name).toString());
                        // System.out.println("evaluating min for " + this.name + " = " + minExpr);
                        generatedMin = MathEval.eval(minExpr);
                        // System.out.println("evaluated min for " + this.name + " = " + generatedMin);
                    } catch (Exception e) {
                        generatedMin = (long) -1;
                        e.printStackTrace();
                    }
                    try {
                        // System.out.println("max for " + this.name + " = " + maxExpr);
                        maxExpr = maxExpr.replaceAll("\\\\b" + dep.name + "\\\\b", valuesMap.get(dep.name).toString());
                        // System.out.println("evaluating max for " + this.name + " = " + maxExpr);
                        generatedMax = MathEval.eval(maxExpr);
                        // System.out.println("evaluated max for " + this.name + " = " + generatedMax);
                    } catch (Exception e) {
                        generatedMax = (long) 1;
                        e.printStackTrace();
                    }
                } else {
                    throw new NullPointerException("Dependencies not generated: '" + dep.name
                            + "' which is required for '" + this.name + "'");
                }
            }
        } else {
            generatedMin = Long.parseLong(min);
            generatedMax = Long.parseLong(max);
        }

        return ThreadLocalRandom.current().nextLong(generatedMin, generatedMax + 1);
    }
}

class MathEval {
    public static long eval(String expression) {
        char[] tokens = expression.toCharArray();

        // Stacks to store operands and operators
        Stack<Long> values = new Stack<>();
        Stack<Character> operators = new Stack<>();

        // Iterate through each character in the expression
        for (int i = 0; i < tokens.length; i++) {
            if (tokens[i] == ' ')
                continue;

            // If the character is a digit or a decimal
            // point, parse the number
            if ((tokens[i] >= '0' && tokens[i] <= '9')
                    || tokens[i] == '.') {
                StringBuilder sb = new StringBuilder();
                // Continue collecting digits and the
                // decimal point to form a number
                while (i < tokens.length
                        && (Character.isDigit(tokens[i])
                                || tokens[i] == '.')) {
                    sb.append(tokens[i]);
                    i++;
                }
                // Parse the collected number and push it to
                // the values stack
                values.push(
                        Long.parseLong(sb.toString()));
                i--; // Decrement i to account for the extra
                     // increment in the loop
            } else if (tokens[i] == '(') {
                // If the character is '(', push it to the
                // operators stack
                operators.push(tokens[i]);
            } else if (tokens[i] == ')') {
                // If the character is ')', pop and apply
                // operators until '(' is encountered
                while (operators.peek() != '(') {
                    values.push(applyOperator(
                            operators.pop(), values.pop(),
                            values.pop()));
                }
                operators.pop(); // Pop the '('
            } else if (tokens[i] == '+' || tokens[i] == '-'
                    || tokens[i] == '*'
                    || tokens[i] == '/') {
                // If the character is an operator, pop and
                // apply operators with higher precedence
                while (!operators.isEmpty()
                        && hasPrecedence(tokens[i],
                                operators.peek())) {
                    values.push(applyOperator(
                            operators.pop(), values.pop(),
                            values.pop()));
                }
                // Push the current operator to the
                // operators stack
                operators.push(tokens[i]);
            }
        }

        // Process any remaining operators in the stack
        while (!operators.isEmpty()) {
            values.push(applyOperator(operators.pop(),
                    values.pop(),
                    values.pop()));
        }

        // The result is the only remaining element in the
        // values stack
        return values.pop();
    }

    // Function to check if operator1 has higher precedence
    // than operator2
    private static boolean hasPrecedence(char operator1,
            char operator2) {
        if (operator2 == '(' || operator2 == ')')
            return false;
        return (operator1 != '*' && operator1 != '/')
                || (operator2 != '+' && operator2 != '-');
    }

    // Function to apply the operator to two operands
    private static long applyOperator(char operator,
            long b, long a) {
        switch (operator) {
            case '+':
                return a + b;
            case '-':
                return a - b;
            case '*':
                return a * b;
            case '/':
                if (b == 0)
                    throw new ArithmeticException(
                            "Cannot divide by zero");
                return a / b;
        }
        return 0;
    }
}
        `;
}
