type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
};

export default function KpiCard({ title, value, subtitle }: Props) {
  return (
    <div style={{
      background: 'white', padding: 18, borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
    }}>
      <div style={{fontSize:12, color:'#64748b', marginBottom:6}}>{title}</div>
      <div style={{fontSize:28, fontWeight:700, color:'#0f172a'}}>{value}</div>
      {subtitle && <div style={{fontSize:13, color:'#94a3b8', marginTop:6}}>{subtitle}</div>}
    </div>
  );
}
