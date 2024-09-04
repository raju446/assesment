import { LightningElement, track, wire } from 'lwc';
import getProductsByCategory from '@salesforce/apex/ProductController.getProductsByCategory';
import getProductCategories from '@salesforce/apex/ProductController.getProductCategories';
import updateProduct from '@salesforce/apex/ProductController.updateProduct';
import deleteProducts from '@salesforce/apex/ProductController.deleteProduct';
import createProduct from '@salesforce/apex/ProductController.createProduct';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
    { label: 'Product Name', fieldName: 'Name' },
    { label: 'Product Code', fieldName: 'ProductCode' },
    { label: 'Description', fieldName: 'Description' },
    { label: 'Category', fieldName: 'Family' },
    {
        type: 'action',
        typeAttributes: {
            rowActions: [
                { label: 'View Details', name: 'view' },
                { label: 'Edit', name: 'edit' },
                { label: 'Delete', name: 'delete' }
            ]
        }
    }
];

export default class ProductList extends LightningElement {
    @track products = [];
    @track categoryOptions = [];
    @track selectedCategory = '';
    @track selectedCategorytitle = 'All Products';
    @track isViewingDetails = false;
    @track isEditing = false;
    @track isDeleting = false;
    @track isNextDisabled = false;
    @track isPreviousDisabled = false;
    @track viewProduct = {};
    @track editProduct = {};
    @track deleteProduct = {};
    @track deleteProductId = null;
    @track currentPage = 1;
    @track totalPages = 1;
    @track pageSize = 10;
    @track isLoading = false;
    @track columns = columns;
    @track wiredProductsResult;
    @track newProduct = {};
    @track isAddingProduct = false;


    @wire(getProductCategories)
    wiredCategories({ error, data }) {
        if (data) {
            this.categoryOptions = [
                { label: '--None--', value: '' },
                ...data.map(category => ({ label: category, value: category }))
            ];
        } else if (error) {
            console.error('Error retrieving categories:', error);
            this.showToast('Error', 'Failed to retrieve categories', 'error');
        }
    }

    @wire(getProductsByCategory, { category: '$selectedCategory' })
    wiredCategoryProducts(result) {
        this.wiredProductsResult = result;
        const { data, error } = result;
        if (data) {
            this.totalPages = Math.ceil(data.length / this.pageSize);
            this.isNextDisabled = this.isPreviousDisabled = (this.totalPages === 1);
            this.updateDisplayedProducts(data);
        } else if (error) {
            console.error('Error retrieving products:', error);
        }
    }

    updateDisplayedProducts(allProducts) {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.products = allProducts.slice(startIndex, endIndex);
    }

    handlePageChange(event) {
        const direction = event.target.dataset.direction;
        if (direction === 'previous' && this.currentPage > 1) {
            this.currentPage--;
        } else if (direction === 'next' && this.currentPage < this.totalPages) {
            this.currentPage++;
        }
        this.updateDisplayedProducts(this.wiredProductsResult.data);
    }

    handleRowAction(event) {
        this.isLoading = true;
        const { name: actionName } = event.detail.action;
        const row = event.detail.row;

        const actions = {
            'view': () => this.viewProductDetails(row),
            'edit': () => this.startEditing(row),
            'delete': () => this.deletedProduct(row)
        };

        if (actionName in actions) {
            actions[actionName]();
        }
        this.isLoading = false;
    }

    viewProductDetails(product) {
        this.viewProduct = { ...product };
        this.isViewingDetails = true;
    }

    startEditing(product) {
        this.editProduct = { ...product };
        this.isEditing = true;
    }

    handleFieldChange(event) {
        const field = event.target.dataset.id;
        this.editProduct = { ...this.editProduct, [field]: event.target.value };
    }

    handleSave() {
        this.isLoading = true;
        updateProduct({ product: this.editProduct })
            .then(() => {
                this.isEditing = false;
                this.refreshProducts();
                this.showToast('Success', this.editProduct.Name + ' Product updated successfully', 'success', 'dismissible');
            })
            .catch(error => {
                console.error('Error updating product:', error);
                this.showToast('Error', 'Failed to update product', 'error', 'sticky');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    deletedProduct(product) {
        this.deleteProduct = { ...product };
        this.isDeleting = true;
    }

    handleDelete() {
        this.isLoading = true;
        deleteProducts({ productId: this.deleteProduct.Id })
            .then(() => {
                this.isDeleting = false;
                this.refreshProducts();
                this.showToast('Success', this.deleteProduct.Name + ' Product deleted successfully', 'success', 'dismissible');
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                this.showToast('Error', error.body.message, 'error', 'sticky');
                this.isLoading = false;
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.newProduct = { ...this.newProduct, [field]: value };
    }

    handleAddProduct(event) {
        event.preventDefault();
        this.isLoading = true;
        const allValid = [...this.template.querySelectorAll('input, select, textarea')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        if (!allValid) {
            this.isLoading = false;
            return;
        }

        createProduct({ productData: this.newProduct })
            .then(result => {
                console.log('Product created:', result);
                this.showToast('Success', result + ' Product created successfully', 'success', 'dismissible');
                this.isLoading = false;
                this.closeModalAction();
                this.refreshProducts();
            })
            .catch(error => {
                this.showToast('Error', 'Error creating product: ' + error.body.message, 'error', 'sticky');
                this.isLoading = false;
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    showAddProductModal() {
        this.isAddingProduct = true;
        this.newProduct = {};
    }

    showToast(title, message, variant, mode) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant,
                mode,
            }),
        );
    }

    closeModalAction() {
        this.isViewingDetails = false;
        this.viewProduct = {};
        this.isEditing = false;
        this.editProduct = {};
        this.isDeleting = false;
        this.deleteProduct = {};
        this.isAddingProduct = false;
        this.newProduct = {};
    }

    refreshProducts() {
        refreshApex(this.wiredProductsResult)
            .then(() => {
                this.showToast('Success', 'Product list refreshed', 'success', 'dismissible');
            })
            .catch(error => {
                console.error('Error refreshing products:', error);
                this.showToast('Error', 'Failed to refresh product list', 'error', 'sticky');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleCategorySelect(event) {
        this.selectedCategory = event.detail.name;
        this.selectedCategorytitle = this.selectedCategory || 'All Products';
        this.currentPage = 1;
    }
}