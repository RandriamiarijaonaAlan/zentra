type Props = {
  data: { label: string; value: number }[];
  height?: number;
};

export default function SimpleBarChart({ data, height = 120 }: Props) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{display:'flex', gap:12, alignItems:'end', height}}>
      {data.map((d, i) => (
        <div key={i} style={{flex:1, textAlign:'center'}}>
          <div style={{
            height: `${(d.value / max) * 100}%`,
            background: 'linear-gradient(180deg,#667eea,#764ba2)',
            borderRadius:8,
            transition:'height 300ms'
          }} />
          <div style={{fontSize:12, color:'#475569', marginTop:8}}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}
