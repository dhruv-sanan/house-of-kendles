import { SiteHeader } from "@/components/site-header"
import { getRecommendationAnalytics } from "@/lib/recommendation-tracking"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MousePointerClick, ShoppingCart, Percent, TrendingUp, ArrowRight } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
    const stats = await getRecommendationAnalytics()

    return (
        <div className="min-h-screen bg-muted/40 pb-20">
            <SiteHeader />

            <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-heading text-3xl text-brand-900">Recommendation Analytics</h1>
                        <p className="text-muted-foreground mt-1">Track performance of impulse and paired product suggestions.</p>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    {/* Total Clicks */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalClicks}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across all recommendations
                            </p>
                        </CardContent>
                    </Card>

                    {/* Conversions */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Add to Carts</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.totalConversions}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Direct conversions from recs
                            </p>
                        </CardContent>
                    </Card>

                    {/* Conversion Rate */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-brand-900">{stats.conversionRate.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Clicks resulting in cart add
                            </p>
                        </CardContent>
                    </Card>

                    {/* Top Channel */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Channel</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.impulseClicks > stats.pairedClicks ? 'Cart Impulse' : 'Product Pairs'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Based on click volume
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Click Distribution */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Click Distribution</CardTitle>
                            <CardDescription>Where users are engaging with recommendations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Cart Page (Impulse)</span>
                                        <span className="text-muted-foreground">{stats.impulseClicks} clicks</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-900 rounded-full transition-all"
                                            style={{ width: `${stats.totalClicks > 0 ? (stats.impulseClicks / stats.totalClicks) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Product Page (Pairs)</span>
                                        <span className="text-muted-foreground">{stats.pairedClicks} clicks</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gold rounded-full transition-all"
                                            style={{ width: `${stats.totalClicks > 0 ? (stats.pairedClicks / stats.totalClicks) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Performing Products */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Top Performing Products</CardTitle>
                            <CardDescription>Best converting recommendations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {stats.topProducts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">No data available yet</p>
                                ) : (
                                    stats.topProducts.map((product, i) => (
                                        <div key={i} className="flex items-center justify-between group">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none text-brand-900 truncate max-w-[200px]">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.conversions} conversions
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-bold text-right">
                                                    {product.clicks > 0 ? Math.round((product.conversions / product.clicks) * 100) : 0}%
                                                    <span className="text-[10px] font-normal text-muted-foreground block">Conv. Rate</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
