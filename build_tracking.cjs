const fs = require('fs');

let trackingViewSrc = fs.readFileSync('src/components/TrackingView.tsx', 'utf8');

trackingViewSrc = trackingViewSrc.replace(
  "import { Order, OrderStatus } from '../types';",
  "import { Order, OrderStatus } from '../types';\nimport { supabase } from '../lib/supabase';"
);

trackingViewSrc = trackingViewSrc.replace(
  /const MOCK_ORDERS: Record\<string, Order\> = \{[\s\S]*?const getOrders = \(\): Record\<string, Order\> => \{[\s\S]*?return MOCK_ORDERS;\n  \};/m,
  ''
);

trackingViewSrc = trackingViewSrc.replace(
  /const handleSearch = \(e\?: React\.FormEvent\) => \{[\s\S]*?setLoading\(false\);\n    \}, 600\);\n  \};/m,
  `
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('id', searchCode.trim()).single();
      
      if (error || !data) {
        setOrder(null);
        setError('No hemos encontrado un proyecto con este código. Verifica e intenta de nuevo.');
      } else {
        setOrder({
          id: data.id,
          status: data.status,
          customerName: data.customer_name,
          projectName: data.project_name,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        });
        setTrackingCode(searchCode.trim());
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al buscar la orden.');
    } finally {
      setLoading(false);
    }
  };
  `
);

fs.writeFileSync('src/components/TrackingView.tsx', trackingViewSrc);
console.log('TrackingView rewritten');
