import React from 'react';
import T from "i18n-react";

import './summit-docs-section.less';

const SummitDocsSection = ({summitDocs}) => {

  if (summitDocs.length === 0) return null;

  return (
    <div className="summit-docs-section">
      <h2>{T.translate("presentations.links_and_materials")}</h2>
      <ul>
        {summitDocs.map(doc =>
          <li key={`summit-doc-${doc.id}`}>
            <a href={doc.file ?? doc.web_link} target="_blank">{doc.label}</a>: {doc.description}
          </li>
        )}
      </ul>
    </div>
  )
};

export default SummitDocsSection;