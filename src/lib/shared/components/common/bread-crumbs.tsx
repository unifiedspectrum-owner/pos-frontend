"use client"

/* React and Chakra UI component imports */
import React from 'react';
import { Breadcrumb } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { lighten } from 'polished';

/* Shared module imports */
import { PRIMARY_COLOR, GRAY_COLOR } from '@shared/config';

/* Breadcrumb item structure */
export interface BreadCrumbs {
  name: string; /* Display name for breadcrumb */
  path: string; /* URL path for breadcrumb */
}

/* Generate breadcrumbs from pathname */
export const generateBreadcrumbs = (pathName: string): BreadCrumbs[] => {
  const pathSegments = pathName.split('/').filter(Boolean);
  const breadcrumbs: BreadCrumbs[] = [];
  
  /* Process path segments */
  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    
    /* Convert segment to readable name */
    let name = segment.replace(/-/g, ' ');
    name = name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    breadcrumbs.push({ name, path: currentPath });
  });
  
  return breadcrumbs;
};

/* Navigation breadcrumb component */
const Breadcrumbs: React.FC = () => {
  /* Get current pathname from Next.js router */
  const pathName = usePathname();

  /* Generate breadcrumb items from pathname */
  const breadcrumbs = generateBreadcrumbs(pathName);
  
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <Breadcrumb.Item>
              <Breadcrumb.Link
                href={crumb.path}
                color={
                  index === breadcrumbs.length - 1 /* Last item is active */
                    ? lighten(0.2, PRIMARY_COLOR)
                    : lighten(0.2, GRAY_COLOR)
                }
                _hover={{
                  color: index === breadcrumbs.length - 1
                    ? lighten(0.2, PRIMARY_COLOR)
                    : lighten(0.2, GRAY_COLOR),
                  textDecoration: 'none',
                }}
              >
                {crumb.name}
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            {/* Add separator between items */}
            {index !== breadcrumbs.length - 1 && <Breadcrumb.Separator />}
          </React.Fragment>
        ))}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
};

export default Breadcrumbs;