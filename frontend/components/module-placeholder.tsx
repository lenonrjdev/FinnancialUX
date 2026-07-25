import { CheckIcon, ReportsIcon } from "./icons";

export default function ModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="module-placeholder">
      <div className="module-placeholder-copy">
        <span className="page-eyebrow">Próxima etapa do projeto</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <article className="module-placeholder-card">
        <span className="placeholder-icon" aria-hidden="true">
          <ReportsIcon />
        </span>
        <div>
          <strong>Módulo preparado na navegação</strong>
          <p>
            Esta área será implementada em uma fase própria, mantendo o mesmo padrão visual e responsivo da visão geral.
          </p>
        </div>
        <span className="placeholder-status"><CheckIcon /> Estrutura pronta</span>
      </article>
    </section>
  );
}
