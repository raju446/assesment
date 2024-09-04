@isTest
public class ProductControllerTest {
    @TestSetup
    static void makeData(){
        List<Product2> products = new List<Product2>();
        products.add(new Product2(Name='Test Product 1', ProductCode='TP1', Description='Test Description 1', Family='Test Family 1', IsActive=true));
        products.add(new Product2(Name='Test Product 2', ProductCode='TP2', Description='Test Description 2', Family='Test Family 2', IsActive=true));
        insert products;
    }
    
    @isTest
    public static void testGetProductCategories() {
        Test.startTest();
        List<String> categories = ProductController.getProductCategories();
        Test.stopTest();

    }
    
    @isTest
    public static void testGetProductsByCategory() {
        Test.startTest();
        List<Product2> allProducts = ProductController.getProductsByCategory('');
        List<Product2> filteredProducts = ProductController.getProductsByCategory('Test Family 1');
        Test.stopTest();
    }
    
    @isTest
    public static void testUpdateProduct() {
        Product2 product = [SELECT Id, Name FROM Product2 WHERE Name = 'Test Product 1' LIMIT 1];
        product.Name = 'Updated Test Product 1';
        
        Test.startTest();
        ProductController.updateProduct(product);
        Test.stopTest();
        
        Product2 updatedProduct = [SELECT Id, Name FROM Product2 WHERE Id = :product.Id];
    }
    
    @isTest
    public static void testDeleteProduct() {
        Product2 product = [SELECT Id FROM Product2 WHERE Name = 'Test Product 1' LIMIT 1];
        
        Test.startTest();
        ProductController.deleteProduct(product.Id);
        Test.stopTest();
        
        List<Product2> remainingProducts = [SELECT Id FROM Product2 WHERE Id = :product.Id];
    }
    
    @isTest
    public static void testCreateProduct() {
        Map<String, Object> productData = new Map<String, Object>{
            'Name' => 'New Test Product',
            'ProductCode' => 'NTP',
            'Description' => 'New Test Description',
            'Family' => 'New Test Family',
            'IsActive' => true
        };
        
        Test.startTest();
        String newProductName = ProductController.createProduct(productData);
        Test.stopTest();
        
        Product2 newProduct = [SELECT Id, Name, ProductCode, Description, Family, IsActive FROM Product2 WHERE Name = :newProductName];
    }
}