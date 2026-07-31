const fs = require('fs');

let trackingViewSrc = fs.readFileSync('src/components/TrackingView.tsx', 'utf8');

trackingViewSrc = trackingViewSrc.replace(
  "// Mock initial data - In production this comes from Supabase",
  `interface TrackingViewProps {
  initialTrackingCode?: string;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ initialTrackingCode = '' }) => {
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode);
  const [searchCode, setSearchCode] = useState(initialTrackingCode);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');`
);

fs.writeFileSync('src/components/TrackingView.tsx', trackingViewSrc);
console.log('Fixed TrackingView');
