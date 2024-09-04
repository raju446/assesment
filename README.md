# Product List LWC

This Lightning Web Component (LWC) is designed to manage and display a list of products in Salesforce. The component includes features for viewing, editing, and deleting products, as well as navigating through different product categories.

## Features

- **Product Listing:** Displays a list of products in a datatable.
- **Category Navigation:** Allows users to filter products by category using a sidebar.
- **Pagination:** Supports pagination to display a limited number of products per page.
- **Product Management:** Includes modals for viewing details, editing, and deleting products.
- **Refresh Products:** Ability to refresh the product list.

## Component Structure

### HTML Template
- **Sidebar Section:** Contains the category navigation using `lightning-vertical-navigation`.
- **Main Content Section:** Displays the product datatable and includes action buttons for viewing, editing, and deleting products.
- **Modals:** Handles viewing, editing, and deleting products in separate modals.

### JavaScript Controller
- **Product Management:** Manages product data, handles CRUD operations, and maintains UI state for modals and pagination.
- **Apex Methods:** 
  - `getProductCategories`: Retrieves product categories.
  - `getProductsByCategory`: Retrieves products filtered by category.
  - `updateProduct`: Updates product information.
  - `deleteProduct`: Deletes a selected product.
  - `createProduct`: Create a product.

### Apex Controller
- **ProductController**: An Apex controller providing methods to fetch product categories, retrieve products by category, update product details, and delete products.

## Pagination Implementation

- The component displays only 10 records by default.
- Navigation between pages is controlled by "Previous" and "Next" buttons.
- The pagination logic handles edge cases where the user is on the first or last page.

## Setup and Deployment

1. **Clone the repository**:
    ```bash
    git clone <repository-url>
    ```

2. **Deploy the Apex Class**:
   Deploy the `ProductController` Apex class to your Salesforce org.

3. **Deploy the LWC**:
   Deploy the `productList` LWC to your Salesforce org.

4. **Add the Component**:
   Add the `productList` component to a Lightning page, app, or community as needed.

## Usage

- After adding the component to a page, it will automatically display the products.
- Use the category sidebar to filter products by category.
- Use the action buttons within the datatable to view, edit, or delete products.
- Use the pagination controls at the bottom of the table to navigate through the list of products.

## Customization

- **Columns**: The columns displayed in the datatable can be modified by changing the `columns` array in the JavaScript file.
- **Category Filtering**: Additional filtering logic can be implemented in the Apex method `getProductsByCategory`.

## Issues and Contributions

If you encounter any issues or have suggestions for improvement, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
