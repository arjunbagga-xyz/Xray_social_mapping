import { useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import { useStore } from '../store';

export default function Graph() {
  const { profiles, relationships, selectNode, selectEdge } = useStore();

  const elements = useMemo(() => {
    const nodes = profiles.map((p) => ({
      data: {
        id: p.handle,
        label: p.handle, // Use handle as label
        image: p.avatarUrl,
      },
    }));

    const edges = relationships.map((r) => ({
      data: {
        id: `${r.source}-${r.target}`,
        source: r.source,
        target: r.target,
        interactionCount: r.interactions,
        sentiment: r.sentiment,
      },
    }));

    return [...nodes, ...edges];
  }, [profiles, relationships]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const style: any[] = [
    {
      selector: 'node',
      style: {
        'background-image': 'data(image)',
        'background-fit': 'cover',
        'width': 60,
        'height': 60,
        'label': 'data(label)',
        'font-size': '12px',
        'text-valign': 'bottom',
        'text-margin-y': 5,
        'color': '#333',
        'border-width': 2,
        'border-color': '#ec4899', // Pink border
      },
    },
    {
        selector: 'node[?image]',
        style: {
             'background-color': '#fff', // Fallback
        }
    },
    {
      selector: 'edge',
      style: {
        'width': (ele: cytoscape.EdgeSingular) => Math.min(Math.max(ele.data('interactionCount') || 1, 1), 10), // Scale width
        'line-color': (ele: cytoscape.EdgeSingular) => {
          const sentiment = ele.data('sentiment');
          if (sentiment === 'hostile') return '#ef4444'; // Red
          if (sentiment === 'friendly') return '#22c55e'; // Green
          return '#ec4899'; // Default Pink
        },
        'target-arrow-color': '#ec4899',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
      },
    },
    {
        selector: 'edge:selected',
        style: {
            'width': 6,
            'line-color': '#be185d', // Darker pink highlight
            'target-arrow-color': '#be185d',
        }
    },
    {
        selector: 'node:selected',
        style: {
            'border-width': 4,
            'border-color': '#be185d', // Darker pink
        }
    }
  ];

  return (
    <CytoscapeComponent
      elements={elements}
      style={{ width: '100%', height: '100%' }}
      stylesheet={style}
      layout={{ name: 'cose', animate: true }}
      cy={(cy: cytoscape.Core) => {
        cy.on('tap', 'node', (event: cytoscape.EventObject) => {
          const node = event.target;
          selectNode(node.id());
        });

        cy.on('tap', 'edge', (event: cytoscape.EventObject) => {
           const edge = event.target;
           selectEdge(edge.id());
        });

        cy.on('tap', (event: cytoscape.EventObject) => {
             if(event.target === cy) {
                 selectNode(null); // This clears both node and edge selection via the store logic
             }
        })
      }}
    />
  );
}
