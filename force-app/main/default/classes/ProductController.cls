public with sharing class ProductController {
    // Get all unique product categories
    @AuraEnabled(cacheable=true)
    public static List<String> getProductCategories() {
        List<String> categories = new List<String>();
        Schema.DescribeFieldResult fieldResult = Product2.Family.getDescribe();
        List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
        for (Schema.PicklistEntry entry : picklistValues) {
            categories.add(entry.getValue());
        }
        return categories;
    }

    // Get all products and filter by category
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductsByCategory(String category) {
        if (String.isBlank(category)) {
            return [SELECT Id, Name, ProductCode, Description, Family FROM Product2];
        } else {
            return [SELECT Id, Name, ProductCode, Description, Family FROM Product2 WHERE Family = :category];
        }
    }

    // Update a product
    @AuraEnabled
    public static void updateProduct(Product2 product) {
        try {
            update product;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating product: ' + e.getMessage());
        }
    }

    // Delete a product
    @AuraEnabled
    public static void deleteProduct(Id productId) {
        try {
            Product2 product = [SELECT Id, Name, ProductCode, Description, Family FROM Product2 WHERE Id = :productId];
            delete product;
        } catch (Exception e) {
            throw new AuraHandledException('Unexpected error: ' + e.getMessage());
        }
    }

    // Create a new product
    @AuraEnabled
    public static String createProduct(Map<String, Object> productData) {
        Product2 newProduct = new Product2(
            Name = (String)productData.get('Name'),
            ProductCode = (String)productData.get('ProductCode'),
            Description = (String)productData.get('Description'),
            Family = (String)productData.get('Family'),
            IsActive = (Boolean)productData.get('IsActive')
        );

        insert newProduct;
        return newProduct.Name;
    }
}