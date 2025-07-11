class Addition {

    void add(int a, int b) {
        System.out.println("Addition of 2 int values: " + (a + b));
    }

    void add(double a, double b) {
        System.out.println("Addition of 2 double values: " + (a + b));
    }

    void add(int a, double b) {
        System.out.println("Addition of int and double values: " + (a + b));
    }

    void add(double a, int b) {
        System.out.println("Addition of double and int values: " + (a + b));
    }

    public static void main(String[] args) {
        Addition obj = new Addition();
        obj.add(10, 20);
        obj.add(20.0, 20.5);
        obj.add(10, 25.5);
        obj.add(20.5, 15);
    }
}
