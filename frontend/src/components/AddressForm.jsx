import React from 'react';


const AddressBlock = ({ address, setAddress, title }) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <input type="text" placeholder="Full Name" value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} className="w-full p-2 border rounded-md" required />
    <input type="text" placeholder="Street Line 1" value={address.street1} onChange={e => setAddress({ ...address, street1: e.target.value })} className="w-full p-2 border rounded-md" required />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <input type="text" placeholder="City" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="w-full p-2 border rounded-md" required />
      <input type="text" placeholder="State/Province" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} className="w-full p-2 border rounded-md" required />
      <input type="text" placeholder="ZIP/Postal Code" value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} className="w-full p-2 border rounded-md" required />
    </div>
    <input type="text" placeholder="Country (2-letter code, e.g., US)" value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} className="w-full p-2 border rounded-md" required />
    <input type="email" placeholder="Email" value={address.email} onChange={e => setAddress({ ...address, email: e.target.value })} className="w-full p-2 border rounded-md" required />
  </div>
);


function AddressForm({ fromAddress, setFromAddress, toAddress, setToAddress }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <AddressBlock address={fromAddress} setAddress={setFromAddress} title="Sender Address (From)" />
      <AddressBlock address={toAddress} setAddress={setToAddress} title="Recipient Address (To)" />
    </div>
  );
}

export default AddressForm;
