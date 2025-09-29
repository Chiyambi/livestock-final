import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import useNutritionReports from '@/hooks/useNutritionReports';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Download, Calendar, FileText, Activity, Heart } from 'lucide-react';

const Reports = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const {
    feedingReports,
    growthData,
    healthSummary,
    loading: reportsLoading,
    fetchFeedingReports,
    fetchGrowthData,
    fetchHealthSummary,
    exportToPDF,
    exportToCSV,
  } = useNutritionReports();

  const [timePeriod, setTimePeriod] = useState('last-30-days');
  const [animalType, setAnimalType] = useState('all');
  const [reportType, setReportType] = useState('nutrition');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFeedingReports(timePeriod, animalType);
      fetchGrowthData(timePeriod, animalType);
      fetchHealthSummary();
    }
  }, [timePeriod, animalType, user]);

  const handleExportPDF = () => {
    const reportData = {
      feedingReports: feedingReports,
      growthData: growthData,
      healthSummary: healthSummary,
      timePeriod: timePeriod,
      animalType: animalType,
      generatedAt: new Date().toISOString(),
    };
    exportToPDF(reportData);
  };

  const handleExportCSV = () => {
    if (reportType === 'nutrition') {
      exportToCSV(feedingReports);
    } else if (reportType === 'growth') {
      const csvData = growthData.flatMap(animal => 
        animal.weights.map(w => ({
          animal_name: animal.animal_name,
          weight: w.weight,
          date: w.date,
          weight_gain: animal.weight_gain,
          growth_rate: animal.growth_rate,
        }))
      );
      exportToCSV(csvData);
    }
  };

  if (loading || !user) {
    return null;
  }

  const chartConfig = {
    quantity: {
      label: "Quantity",
      color: "hsl(var(--primary))",
    },
    weight: {
      label: "Weight",
      color: "hsl(var(--primary))",
    },
    count: {
      label: "Count",
      color: "hsl(var(--secondary))",
    },
  };

  const healthStatusData = healthSummary ? [
    { name: 'Healthy', value: healthSummary.healthy_animals, color: 'hsl(var(--primary))' },
    { name: 'Need Attention', value: healthSummary.animals_needing_attention, color: 'hsl(var(--destructive))' },
  ] : [];

  const vaccinationData = healthSummary ? [
    { name: 'Completed', value: healthSummary.completed_vaccinations, color: 'hsl(var(--primary))' },
    { name: 'Pending', value: healthSummary.pending_vaccinations, color: 'hsl(var(--muted))' },
  ] : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">Nutrition Reports</h1>
          <Button size="sm" variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Report Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Report Filters</CardTitle>
            <CardDescription>
              Customize your nutrition and growth reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-7-days">Last 7 days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 days</SelectItem>
                    <SelectItem value="last-year">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Animal Type</label>
                <Select value={animalType} onValueChange={setAnimalType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Animals</SelectItem>
                    <SelectItem value="cattle">Cattle</SelectItem>
                    <SelectItem value="goats">Goats</SelectItem>
                    <SelectItem value="chickens">Chickens</SelectItem>
                    <SelectItem value="pigs">Pigs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nutrition">Nutrition Analysis</SelectItem>
                    <SelectItem value="growth">Growth Tracking</SelectItem>
                    <SelectItem value="health">Health Summary</SelectItem>
                    <SelectItem value="feeding">Feeding Patterns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Tabs defaultValue="nutrition" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="nutrition" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Feed Consumption
                  </CardTitle>
                  <CardDescription>
                    Track feed intake patterns over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reportsLoading ? (
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center">
                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50 animate-spin" />
                        <p>Loading nutrition data...</p>
                      </div>
                    </div>
                  ) : feedingReports.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-48">
                      <BarChart data={feedingReports}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="feed_type" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="total_quantity" fill="var(--color-quantity)" />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No feeding data available</p>
                        <p className="text-sm">Add feeding records to generate charts</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Feed Distribution
                  </CardTitle>
                  <CardDescription>
                    Distribution of feed types by animals fed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reportsLoading ? (
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center">
                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50 animate-spin" />
                        <p>Loading distribution data...</p>
                      </div>
                    </div>
                  ) : feedingReports.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-48">
                      <BarChart data={feedingReports}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="feed_type" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="animals_fed" fill="var(--color-count)" />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No distribution data available</p>
                        <p className="text-sm">Add feeding records to calculate distribution</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="growth" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Tracking</CardTitle>
                  <CardDescription>
                    Monitor weight gain and development progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reportsLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50 animate-spin" />
                        <p>Loading growth data...</p>
                      </div>
                    </div>
                  ) : growthData.length > 0 ? (
                    <div className="space-y-4">
                      {growthData.map((animal) => (
                        <div key={animal.animal_id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{animal.animal_name}</h4>
                            <div className="text-sm text-muted-foreground">
                              Gain: {animal.weight_gain.toFixed(1)} kg | Rate: {animal.growth_rate.toFixed(2)} kg/day
                            </div>
                          </div>
                          <ChartContainer config={chartConfig} className="h-32">
                            <LineChart data={animal.weights}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                              />
                              <YAxis />
                              <ChartTooltip 
                                content={<ChartTooltipContent />}
                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="weight" 
                                stroke="var(--color-weight)" 
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ChartContainer>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No growth data available</p>
                        <p className="text-sm">Record animal weights to track growth trends</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Health Status Overview</CardTitle>
                  <CardDescription>
                    Distribution of animal health conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reportsLoading ? (
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center">
                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50 animate-spin" />
                        <p>Loading health data...</p>
                      </div>
                    </div>
                  ) : healthSummary && healthSummary.total_animals > 0 ? (
                    <ChartContainer config={chartConfig} className="h-48">
                      <PieChart>
                        <Pie
                          data={healthStatusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {healthStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No health data available</p>
                        <p className="text-sm">Add animals to track health status</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vaccination Status</CardTitle>
                  <CardDescription>
                    Overview of vaccination records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reportsLoading ? (
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center">
                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50 animate-spin" />
                        <p>Loading vaccination data...</p>
                      </div>
                    </div>
                  ) : healthSummary && vaccinationData.some(d => d.value > 0) ? (
                    <ChartContainer config={chartConfig} className="h-48">
                      <PieChart>
                        <Pie
                          data={vaccinationData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {vaccinationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No vaccination records available</p>
                        <p className="text-sm">Add vaccination records to generate health reports</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Reports</CardTitle>
                <CardDescription>
                  Download comprehensive reports for research and record-keeping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={handleExportPDF}
                    disabled={reportsLoading || (!feedingReports.length && !growthData.length)}
                  >
                    <Download className="h-6 w-6 mb-2" />
                    <span>Export as PDF</span>
                    <span className="text-xs text-muted-foreground">Formatted report</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={handleExportCSV}
                    disabled={reportsLoading || (!feedingReports.length && !growthData.length)}
                  >
                    <Download className="h-6 w-6 mb-2" />
                    <span>Export as CSV</span>
                    <span className="text-xs text-muted-foreground">Raw data</span>
                  </Button>
                </div>
                {healthSummary && (
                  <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{healthSummary.total_animals}</div>
                      <div className="text-sm text-muted-foreground">Total Animals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{feedingReports.length}</div>
                      <div className="text-sm text-muted-foreground">Feed Types</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{growthData.length}</div>
                      <div className="text-sm text-muted-foreground">Growth Records</div>
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  {(feedingReports.length > 0 || growthData.length > 0) 
                    ? 'Click export buttons to download your nutrition reports'
                    : 'Reports will be generated once you have feeding and health data'
                  }
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Reports;