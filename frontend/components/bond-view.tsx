import { InfoIcon } from "./icons";

const rows = [1, 2, 3, 4].map((id) => ({
  id,
  asset: "BUSD",
  price: "$15.68",
  roi: "-76.09%",
  purchased: "$82,783",
  duration: "14 days",
}));

export default function BondView() {
  return (
    <div className="bond-page">
      <div className="page-heading-row bond-heading">
        <div>
          <h1>Bond (4,4)</h1>
          <p>Treasury Balance: <strong>$326,528</strong></p>
        </div>
      </div>

      <section className="bond-table-card">
        <table>
          <thead><tr><th>Bond</th><th>Price</th><th>ROI</th><th>Purchased</th><th>Duration</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td><span className="coin"><span>◆</span></span>{row.asset}</td>
                <td>{row.price}</td><td>{row.roi}</td><td>{row.purchased}</td><td>{row.duration}</td>
                <td><button className="bond-button">Bond</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bond-mobile-list">
        {rows.map((row) => (
          <article className="bond-mobile-card" key={row.id}>
            <div className="bond-mobile-title"><span className="coin"><span>◆</span></span><strong>{row.asset}</strong></div>
            <div className="mobile-bond-grid">
              <div><span>Price</span><strong>{row.price}</strong></div>
              <div><span>ROI</span><strong>{row.roi}</strong></div>
              <div><span>Purchased</span><strong>{row.purchased}</strong></div>
              <div><span>Duration</span><strong>{row.duration}</strong></div>
            </div>
            <button className="bond-button mobile">Bond</button>
          </article>
        ))}
      </section>

      <section className="important-card">
        <InfoIcon />
        <div><strong>Important</strong><p>New bonds are auto-staked (accrue rebase rewards) and no longer vest linearly. Simply claim as sHUMP at the end of the term.</p></div>
      </section>
    </div>
  );
}
