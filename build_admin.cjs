const fs = require('fs');

let adminViewSrc = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

adminViewSrc = adminViewSrc.replace(
  "import { Save, Plus, Search, CheckCircle2 } from 'lucide-react';",
  "import { Save, Plus, Search, CheckCircle2 } from 'lucide-react';\nimport { supabase } from '../lib/supabase';"
);

adminViewSrc = adminViewSrc.replace(
  /const getOrders = \(\): Record\<string, Order\> => \{[\s\S]*?const updateOrderStatus = \(id: string, status: OrderStatus\) => \{[\s\S]*?saveOrders\(updated\);\n  \};/m,
  `
  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) {
      const ordersMap: Record<string, Order> = {};
      data.forEach(order => {
        ordersMap[order.id] = {
          id: order.id,
          status: order.status,
          customerName: order.customer_name,
          projectName: order.project_name,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
        };
      });
      setOrders(ordersMap);
    }
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        fetchOrders();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderId.trim() || !newCustomerName.trim() || !newProjectName.trim()) return;

    const newOrder = {
      id: newOrderId.trim(),
      status: newStatus,
      customer_name: newCustomerName.trim(),
      project_name: newProjectName.trim(),
    };

    const { error } = await supabase.from('orders').insert([newOrder]);
    
    // In a real app we might rely on realtime or fetchOrders() but since realtime is on, it will update.
    if (error) {
      console.error(error);
      alert('Error: No se pudo crear la orden. ' + error.message);
      return;
    }
    
    setNewOrderId('');
    setNewCustomerName('');
    setNewProjectName('');
    setNewStatus('COTIZADO');
    
    setSuccessMsg(\`Orden #\${newOrder.id} creada correctamente.\`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    // optimistic update
    const updatedOrder = { ...orders[id], status, updatedAt: new Date().toISOString() };
    setOrders({ ...orders, [id]: updatedOrder });
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  };
  `
);

// We need to remove the extra useEffect that was in the original code
adminViewSrc = adminViewSrc.replace(
  /useEffect\(\(\) => \{\n    setOrders\(getOrders\(\)\);\n  \}, \[\]\);\n/m,
  ''
);

fs.writeFileSync('src/components/AdminView.tsx', adminViewSrc);
console.log('AdminView rewritten');
