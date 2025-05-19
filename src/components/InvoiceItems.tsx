import React from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';

type InvoiceItemFields = {
  name: string;
  description: string;
  amount_usd: number;
};

type InvoiceItemRowProps = {
  item: InvoiceItemFields;
  index: number;
  exchangeRate: number;
  onUpdate: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
};

const InvoiceItemRow = ({ item, index, exchangeRate, onUpdate, onRemove }: InvoiceItemRowProps) => {
  const amountInr = (item.amount_usd * exchangeRate).toFixed(2);

  return (
    <div className="flex flex-col sm:flex-row gap-2 p-3 border border-gray-200 rounded-md mb-2 bg-gray-50">
      <div className="flex-1">
        <Input
          id={`item-name-${index}`}
          name={`item-name-${index}`}
          label="Item Name"
          value={item.name}
          onChange={(e) => onUpdate(index, 'name', e.target.value)}
          required
        />
      </div>
      <div className="flex-1">
        <Input
          id={`item-desc-${index}`}
          name={`item-desc-${index}`}
          label="Description"
          value={item.description}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
        />
      </div>
      <div className="w-full sm:w-32">
        <Input
          id={`item-amount-${index}`}
          name={`item-amount-${index}`}
          label="Amount (USD)"
          type="number"
          value={item.amount_usd.toString()}
          onChange={(e) => onUpdate(index, 'amount_usd', parseFloat(e.target.value) || 0)}
          required
        />
        <div className="text-sm text-gray-600 mt-1">
          ₹ {amountInr}
        </div>
      </div>
      <div className="flex items-end pb-1">
        <Button
          variant="danger"
          onClick={() => onRemove(index)}
          className="px-2 py-1 h-10"
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

type InvoiceItemsProps = {
  items: InvoiceItemFields[];
  exchangeRate: number;
  onItemsChange: (items: InvoiceItemFields[]) => void;
};

const InvoiceItems = ({ items, exchangeRate, onItemsChange }: InvoiceItemsProps) => {
  const addItem = () => {
    const newItems = [
      ...items,
      { name: '', description: '', amount_usd: 0 }
    ];
    onItemsChange(newItems);
  };
  const updateItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onItemsChange(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Invoice Items</h3>
        <Button onClick={addItem} variant="secondary">
          Add Item
        </Button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded-md">
            No items added yet. Click &quot;Add Item&quot; to get started.
          </div>
        ) : (
          items.map((item, index) => (
            <InvoiceItemRow
              key={index}
              item={item}
              index={index}
              exchangeRate={exchangeRate}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <div className="text-right">
              <div>${items.reduce((sum, item) => sum + (item.amount_usd || 0), 0).toFixed(2)}</div>
              <div className="text-sm text-gray-600">
                ₹{(items.reduce((sum, item) => sum + (item.amount_usd || 0), 0) * exchangeRate).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceItems;
