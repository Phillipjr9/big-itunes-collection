/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols
// TanStack Router route tree — keep in sync with src/routes/

import { Route as rootRouteImport } from './routes/__root'
import { Route as AppRouteImport } from './routes/app'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ShopRouteImport } from './routes/shop'
import { Route as CheckoutRouteImport } from './routes/checkout'
import { Route as WishlistRouteImport } from './routes/wishlist'
import { Route as ContactRouteImport } from './routes/contact'
import { Route as DeliveryRouteImport } from './routes/delivery'
import { Route as ReturnsRouteImport } from './routes/returns'
import { Route as FaqsRouteImport } from './routes/faqs'
import { Route as SizeGuideRouteImport } from './routes/size-guide'
import { Route as PrivacyRouteImport } from './routes/privacy'
import { Route as TermsRouteImport } from './routes/terms'
import { Route as TrackOrderRouteImport } from './routes/track-order'
import { Route as ProductIdRouteImport } from './routes/product.$id'
import { Route as OrderIdRouteImport } from './routes/order.$id'
import { Route as AppIndexRouteImport } from './routes/app/index'
import { Route as AppProductsRouteImport } from './routes/app/products'
import { Route as AppOrdersRouteImport } from './routes/app/orders'
import { Route as AppInventoryRouteImport } from './routes/app/inventory'
import { Route as AppDiscountsRouteImport } from './routes/app/discounts'
import { Route as AppReturnsRouteImport } from './routes/app/returns'
import { Route as AppHomepageRouteImport } from './routes/app/homepage'
import { Route as AppWholesaleRouteImport } from './routes/app/wholesale'
import { Route as AppStaffRouteImport } from './routes/app/staff'
import { Route as AppCategoriesRouteImport } from './routes/app/categories'
import { Route as AppPackagesRouteImport } from './routes/app/packages'

const AppRoute = AppRouteImport.update({ id: '/app', path: '/app', getParentRoute: () => rootRouteImport } as any)
const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const ShopRoute = ShopRouteImport.update({ id: '/shop', path: '/shop', getParentRoute: () => rootRouteImport } as any)
const CheckoutRoute = CheckoutRouteImport.update({ id: '/checkout', path: '/checkout', getParentRoute: () => rootRouteImport } as any)
const WishlistRoute = WishlistRouteImport.update({ id: '/wishlist', path: '/wishlist', getParentRoute: () => rootRouteImport } as any)
const ContactRoute = ContactRouteImport.update({ id: '/contact', path: '/contact', getParentRoute: () => rootRouteImport } as any)
const DeliveryRoute = DeliveryRouteImport.update({ id: '/delivery', path: '/delivery', getParentRoute: () => rootRouteImport } as any)
const ReturnsRoute = ReturnsRouteImport.update({ id: '/returns', path: '/returns', getParentRoute: () => rootRouteImport } as any)
const FaqsRoute = FaqsRouteImport.update({ id: '/faqs', path: '/faqs', getParentRoute: () => rootRouteImport } as any)
const SizeGuideRoute = SizeGuideRouteImport.update({ id: '/size-guide', path: '/size-guide', getParentRoute: () => rootRouteImport } as any)
const PrivacyRoute = PrivacyRouteImport.update({ id: '/privacy', path: '/privacy', getParentRoute: () => rootRouteImport } as any)
const TermsRoute = TermsRouteImport.update({ id: '/terms', path: '/terms', getParentRoute: () => rootRouteImport } as any)
const TrackOrderRoute = TrackOrderRouteImport.update({ id: '/track-order', path: '/track-order', getParentRoute: () => rootRouteImport } as any)
const ProductIdRoute = ProductIdRouteImport.update({ id: '/product/$id', path: '/product/$id', getParentRoute: () => rootRouteImport } as any)
const OrderIdRoute = OrderIdRouteImport.update({ id: '/order/$id', path: '/order/$id', getParentRoute: () => rootRouteImport } as any)
const AppIndexRoute = AppIndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => AppRoute } as any)
const AppProductsRoute = AppProductsRouteImport.update({ id: '/products', path: '/products', getParentRoute: () => AppRoute } as any)
const AppOrdersRoute = AppOrdersRouteImport.update({ id: '/orders', path: '/orders', getParentRoute: () => AppRoute } as any)
const AppInventoryRoute = AppInventoryRouteImport.update({ id: '/inventory', path: '/inventory', getParentRoute: () => AppRoute } as any)
const AppDiscountsRoute = AppDiscountsRouteImport.update({ id: '/discounts', path: '/discounts', getParentRoute: () => AppRoute } as any)
const AppReturnsRoute = AppReturnsRouteImport.update({ id: '/returns', path: '/returns', getParentRoute: () => AppRoute } as any)
const AppHomepageRoute = AppHomepageRouteImport.update({ id: '/homepage', path: '/homepage', getParentRoute: () => AppRoute } as any)
const AppWholesaleRoute = AppWholesaleRouteImport.update({ id: '/wholesale', path: '/wholesale', getParentRoute: () => AppRoute } as any)
const AppStaffRoute = AppStaffRouteImport.update({ id: '/staff', path: '/staff', getParentRoute: () => AppRoute } as any)
const AppCategoriesRoute = AppCategoriesRouteImport.update({ id: '/categories', path: '/categories', getParentRoute: () => AppRoute } as any)
const AppPackagesRoute = AppPackagesRouteImport.update({ id: '/packages', path: '/packages', getParentRoute: () => AppRoute } as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/shop': typeof ShopRoute
  '/checkout': typeof CheckoutRoute
  '/wishlist': typeof WishlistRoute
  '/contact': typeof ContactRoute
  '/delivery': typeof DeliveryRoute
  '/returns': typeof ReturnsRoute
  '/faqs': typeof FaqsRoute
  '/size-guide': typeof SizeGuideRoute
  '/privacy': typeof PrivacyRoute
  '/terms': typeof TermsRoute
  '/track-order': typeof TrackOrderRoute
  '/product/$id': typeof ProductIdRoute
  '/order/$id': typeof OrderIdRoute
  '/app': typeof AppRouteWithChildren
  '/app/': typeof AppIndexRoute
  '/app/products': typeof AppProductsRoute
  '/app/orders': typeof AppOrdersRoute
  '/app/inventory': typeof AppInventoryRoute
  '/app/discounts': typeof AppDiscountsRoute
  '/app/returns': typeof AppReturnsRoute
  '/app/homepage': typeof AppHomepageRoute
  '/app/wholesale': typeof AppWholesaleRoute
  '/app/staff': typeof AppStaffRoute
  '/app/categories': typeof AppCategoriesRoute
  '/app/packages': typeof AppPackagesRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/shop': typeof ShopRoute
  '/checkout': typeof CheckoutRoute
  '/wishlist': typeof WishlistRoute
  '/contact': typeof ContactRoute
  '/delivery': typeof DeliveryRoute
  '/returns': typeof ReturnsRoute
  '/faqs': typeof FaqsRoute
  '/size-guide': typeof SizeGuideRoute
  '/privacy': typeof PrivacyRoute
  '/terms': typeof TermsRoute
  '/track-order': typeof TrackOrderRoute
  '/product/$id': typeof ProductIdRoute
  '/order/$id': typeof OrderIdRoute
  '/app': typeof AppIndexRoute
  '/app/products': typeof AppProductsRoute
  '/app/orders': typeof AppOrdersRoute
  '/app/inventory': typeof AppInventoryRoute
  '/app/discounts': typeof AppDiscountsRoute
  '/app/returns': typeof AppReturnsRoute
  '/app/homepage': typeof AppHomepageRoute
  '/app/wholesale': typeof AppWholesaleRoute
  '/app/staff': typeof AppStaffRoute
  '/app/categories': typeof AppCategoriesRoute
  '/app/packages': typeof AppPackagesRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/shop': typeof ShopRoute
  '/checkout': typeof CheckoutRoute
  '/wishlist': typeof WishlistRoute
  '/contact': typeof ContactRoute
  '/delivery': typeof DeliveryRoute
  '/returns': typeof ReturnsRoute
  '/faqs': typeof FaqsRoute
  '/size-guide': typeof SizeGuideRoute
  '/privacy': typeof PrivacyRoute
  '/terms': typeof TermsRoute
  '/track-order': typeof TrackOrderRoute
  '/product/$id': typeof ProductIdRoute
  '/order/$id': typeof OrderIdRoute
  '/app': typeof AppRouteWithChildren
  '/app/': typeof AppIndexRoute
  '/app/products': typeof AppProductsRoute
  '/app/orders': typeof AppOrdersRoute
  '/app/inventory': typeof AppInventoryRoute
  '/app/discounts': typeof AppDiscountsRoute
  '/app/returns': typeof AppReturnsRoute
  '/app/homepage': typeof AppHomepageRoute
  '/app/wholesale': typeof AppWholesaleRoute
  '/app/staff': typeof AppStaffRoute
  '/app/categories': typeof AppCategoriesRoute
  '/app/packages': typeof AppPackagesRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: keyof FileRoutesByFullPath
  fileRoutesByTo: FileRoutesByTo
  to: keyof FileRoutesByTo
  id: keyof FileRoutesById
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ShopRoute: typeof ShopRoute
  CheckoutRoute: typeof CheckoutRoute
  WishlistRoute: typeof WishlistRoute
  ContactRoute: typeof ContactRoute
  DeliveryRoute: typeof DeliveryRoute
  ReturnsRoute: typeof ReturnsRoute
  FaqsRoute: typeof FaqsRoute
  SizeGuideRoute: typeof SizeGuideRoute
  PrivacyRoute: typeof PrivacyRoute
  TermsRoute: typeof TermsRoute
  TrackOrderRoute: typeof TrackOrderRoute
  ProductIdRoute: typeof ProductIdRoute
  OrderIdRoute: typeof OrderIdRoute
  AppRoute: typeof AppRouteWithChildren
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/app': { id: '/app'; path: '/app'; fullPath: '/app'; preLoaderRoute: typeof AppRouteImport; parentRoute: typeof rootRouteImport }
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/shop': { id: '/shop'; path: '/shop'; fullPath: '/shop'; preLoaderRoute: typeof ShopRouteImport; parentRoute: typeof rootRouteImport }
    '/checkout': { id: '/checkout'; path: '/checkout'; fullPath: '/checkout'; preLoaderRoute: typeof CheckoutRouteImport; parentRoute: typeof rootRouteImport }
    '/wishlist': { id: '/wishlist'; path: '/wishlist'; fullPath: '/wishlist'; preLoaderRoute: typeof WishlistRouteImport; parentRoute: typeof rootRouteImport }
    '/contact': { id: '/contact'; path: '/contact'; fullPath: '/contact'; preLoaderRoute: typeof ContactRouteImport; parentRoute: typeof rootRouteImport }
    '/delivery': { id: '/delivery'; path: '/delivery'; fullPath: '/delivery'; preLoaderRoute: typeof DeliveryRouteImport; parentRoute: typeof rootRouteImport }
    '/returns': { id: '/returns'; path: '/returns'; fullPath: '/returns'; preLoaderRoute: typeof ReturnsRouteImport; parentRoute: typeof rootRouteImport }
    '/faqs': { id: '/faqs'; path: '/faqs'; fullPath: '/faqs'; preLoaderRoute: typeof FaqsRouteImport; parentRoute: typeof rootRouteImport }
    '/size-guide': { id: '/size-guide'; path: '/size-guide'; fullPath: '/size-guide'; preLoaderRoute: typeof SizeGuideRouteImport; parentRoute: typeof rootRouteImport }
    '/privacy': { id: '/privacy'; path: '/privacy'; fullPath: '/privacy'; preLoaderRoute: typeof PrivacyRouteImport; parentRoute: typeof rootRouteImport }
    '/terms': { id: '/terms'; path: '/terms'; fullPath: '/terms'; preLoaderRoute: typeof TermsRouteImport; parentRoute: typeof rootRouteImport }
    '/track-order': { id: '/track-order'; path: '/track-order'; fullPath: '/track-order'; preLoaderRoute: typeof TrackOrderRouteImport; parentRoute: typeof rootRouteImport }
    '/product/$id': { id: '/product/$id'; path: '/product/$id'; fullPath: '/product/$id'; preLoaderRoute: typeof ProductIdRouteImport; parentRoute: typeof rootRouteImport }
    '/order/$id': { id: '/order/$id'; path: '/order/$id'; fullPath: '/order/$id'; preLoaderRoute: typeof OrderIdRouteImport; parentRoute: typeof rootRouteImport }
    '/app/': { id: '/app/'; path: '/'; fullPath: '/app/'; preLoaderRoute: typeof AppIndexRouteImport; parentRoute: typeof AppRoute }
    '/app/products': { id: '/app/products'; path: '/products'; fullPath: '/app/products'; preLoaderRoute: typeof AppProductsRouteImport; parentRoute: typeof AppRoute }
    '/app/orders': { id: '/app/orders'; path: '/orders'; fullPath: '/app/orders'; preLoaderRoute: typeof AppOrdersRouteImport; parentRoute: typeof AppRoute }
    '/app/inventory': { id: '/app/inventory'; path: '/inventory'; fullPath: '/app/inventory'; preLoaderRoute: typeof AppInventoryRouteImport; parentRoute: typeof AppRoute }
    '/app/discounts': { id: '/app/discounts'; path: '/discounts'; fullPath: '/app/discounts'; preLoaderRoute: typeof AppDiscountsRouteImport; parentRoute: typeof AppRoute }
    '/app/returns': { id: '/app/returns'; path: '/returns'; fullPath: '/app/returns'; preLoaderRoute: typeof AppReturnsRouteImport; parentRoute: typeof AppRoute }
    '/app/homepage': { id: '/app/homepage'; path: '/homepage'; fullPath: '/app/homepage'; preLoaderRoute: typeof AppHomepageRouteImport; parentRoute: typeof AppRoute }
    '/app/wholesale': { id: '/app/wholesale'; path: '/wholesale'; fullPath: '/app/wholesale'; preLoaderRoute: typeof AppWholesaleRouteImport; parentRoute: typeof AppRoute }
    '/app/staff': { id: '/app/staff'; path: '/staff'; fullPath: '/app/staff'; preLoaderRoute: typeof AppStaffRouteImport; parentRoute: typeof AppRoute }
    '/app/categories': { id: '/app/categories'; path: '/categories'; fullPath: '/app/categories'; preLoaderRoute: typeof AppCategoriesRouteImport; parentRoute: typeof AppRoute }
    '/app/packages': { id: '/app/packages'; path: '/packages'; fullPath: '/app/packages'; preLoaderRoute: typeof AppPackagesRouteImport; parentRoute: typeof AppRoute }
  }
}

interface AppRouteChildren {
  AppIndexRoute: typeof AppIndexRoute
  AppProductsRoute: typeof AppProductsRoute
  AppOrdersRoute: typeof AppOrdersRoute
  AppInventoryRoute: typeof AppInventoryRoute
  AppDiscountsRoute: typeof AppDiscountsRoute
  AppReturnsRoute: typeof AppReturnsRoute
  AppHomepageRoute: typeof AppHomepageRoute
  AppWholesaleRoute: typeof AppWholesaleRoute
  AppStaffRoute: typeof AppStaffRoute
  AppCategoriesRoute: typeof AppCategoriesRoute
  AppPackagesRoute: typeof AppPackagesRoute
}

const AppRouteChildren: AppRouteChildren = {
  AppIndexRoute,
  AppProductsRoute,
  AppOrdersRoute,
  AppInventoryRoute,
  AppDiscountsRoute,
  AppReturnsRoute,
  AppHomepageRoute,
  AppWholesaleRoute,
  AppStaffRoute,
  AppCategoriesRoute,
  AppPackagesRoute,
}

const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute,
  ShopRoute,
  CheckoutRoute,
  WishlistRoute,
  ContactRoute,
  DeliveryRoute,
  ReturnsRoute,
  FaqsRoute,
  SizeGuideRoute,
  PrivacyRoute,
  TermsRoute,
  TrackOrderRoute,
  ProductIdRoute,
  OrderIdRoute,
  AppRoute: AppRouteWithChildren,
}
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()
