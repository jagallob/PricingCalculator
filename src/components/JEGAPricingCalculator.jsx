import React, { useState, useEffect } from "react";
import {
  Calculator,
  Users,
  Building2,
  Clock,
  FileText,
  Check,
  X,
} from "lucide-react";

const JEGAPricingCalculator = () => {
  const [deploymentType, setDeploymentType] = useState("saas");
  const [companySize, setCompanySize] = useState("small");
  const [selectedModules, setSelectedModules] = useState({
    extraHours: false,
    reports: false,
  });
  const [employeeCount, setEmployeeCount] = useState(50);
  const [customEmployeeCount, setCustomEmployeeCount] = useState("");

  // Costos de infraestructura mensual (basado en cotización real Render + Vercel)
  const infraCosts = {
    saas: {
      // Costo por empresa: Render Web Service ($25) + PostgreSQL ($7 + $1.50 storage) + Vercel prorrateado ($4)
      small: 37.5, // $37.50/mes por empresa
      medium: 45.0, // Más recursos para empresas medianas
      large: 65.0, // Recursos premium para grandes empresas
    },
  };

  // Precios base transparentes (ahora incluyen margen sobre infraestructura)
  const basePricing = {
    saas: {
      small: {
        base: 89,
        perEmployee: 0.5,
        max: 149,
        infraCost: infraCosts.saas.small,
      },
      medium: {
        base: 299,
        perEmployee: 0.8,
        max: 599,
        infraCost: infraCosts.saas.medium,
      },
      large: {
        base: 799,
        perEmployee: 1.2,
        max: 1999,
        infraCost: infraCosts.saas.large,
      },
    },
    onpremise: {
      small: { license: 8000, maintenance: 0.22, implementation: 3000 },
      medium: { license: 15000, maintenance: 0.23, implementation: 5000 },
      large: { license: 25000, maintenance: 0.25, implementation: 8000 },
    },
  };

  const moduleMultipliers = {
    extraHours: { saas: 1.0, onpremise: 1.0 },
    reports: { saas: 1.3, onpremise: 1.4 }, // Mayor valor por IA
  };

  const companySizes = {
    small: { label: "PYME (1-200 empleados)", range: [1, 200] },
    medium: { label: "Mediana (201-1000 empleados)", range: [201, 1000] },
    large: { label: "Grande (1000+ empleados)", range: [1000, 5000] },
  };

  // Calcular precio automáticamente
  const calculatePrice = () => {
    const selectedModulesCount =
      Object.values(selectedModules).filter(Boolean).length;
    if (selectedModulesCount === 0)
      return { monthly: 0, annual: 0, setup: 0, total3Years: 0 };

    const actualEmployeeCount = customEmployeeCount
      ? parseInt(customEmployeeCount) || employeeCount
      : employeeCount;
    const pricing = basePricing[deploymentType][companySize];

    // Calcular multiplicador por módulos seleccionados
    let moduleMultiplier = 0;
    if (selectedModules.extraHours)
      moduleMultiplier += moduleMultipliers.extraHours[deploymentType];
    if (selectedModules.reports)
      moduleMultiplier += moduleMultipliers.reports[deploymentType];

    if (deploymentType === "saas") {
      const basePrice = pricing.base * moduleMultiplier;
      const employeePrice =
        actualEmployeeCount * pricing.perEmployee * moduleMultiplier;
      const monthlyPrice = Math.min(
        basePrice + employeePrice,
        pricing.max * moduleMultiplier
      );
      const annualPrice = monthlyPrice * 12 * 0.85; // 15% descuento anual

      return {
        monthly: Math.round(monthlyPrice),
        annual: Math.round(annualPrice),
        setup: 500,
        total3Years: Math.round(annualPrice * 3 + 500),
        infraCost: pricing.infraCost,
        grossMargin: Math.round(
          ((monthlyPrice - pricing.infraCost) / monthlyPrice) * 100
        ),
      };
    } else {
      const licensePrice = pricing.license * moduleMultiplier;
      const maintenanceAnnual = licensePrice * pricing.maintenance;
      const implementation = pricing.implementation;

      return {
        license: Math.round(licensePrice),
        maintenance: Math.round(maintenanceAnnual),
        implementation: Math.round(implementation),
        total3Years: Math.round(
          licensePrice + maintenanceAnnual * 3 + implementation
        ),
      };
    }
  };

  const price = calculatePrice();

  const handleModuleChange = (module) => {
    setSelectedModules((prev) => ({
      ...prev,
      [module]: !prev[module],
    }));
  };

  const handleEmployeeCountChange = (value) => {
    setEmployeeCount(value);
    setCustomEmployeeCount("");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-8 h-8" />
            <h1 className="text-3xl font-bold">JEGASolutions</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Calculadora de Precios - Suite Digital Modular
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 p-8">
          {/* Configuración */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tipo de Despliegue */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Tipo de Despliegue
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setDeploymentType("saas")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    deploymentType === "saas"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h4 className="font-semibold text-lg">SaaS (Nube)</h4>
                  <p className="text-sm text-gray-600">
                    Pago mensual, todo incluido
                  </p>
                </button>
                <button
                  onClick={() => setDeploymentType("onpremise")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    deploymentType === "onpremise"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h4 className="font-semibold text-lg">On-Premise</h4>
                  <p className="text-sm text-gray-600">
                    Licencia perpetua + Docker
                  </p>
                </button>
              </div>
            </div>

            {/* Tamaño de Empresa */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Tamaño de Empresa
              </h3>
              <div className="space-y-3">
                {Object.entries(companySizes).map(([size, info]) => (
                  <button
                    key={size}
                    onClick={() => setCompanySize(size)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      companySize === size
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold">{info.label}</div>
                    <div className="text-sm text-gray-600">
                      {info.range[0]} -{" "}
                      {info.range[1] === 5000 ? "5000+" : info.range[1]}{" "}
                      empleados
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Número de Empleados */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">
                Número de Empleados
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 200, 500].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleEmployeeCountChange(count)}
                      className={`p-3 rounded-lg border transition-all ${
                        employeeCount === count && !customEmployeeCount
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    O ingresa cantidad personalizada:
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 350"
                    value={customEmployeeCount}
                    onChange={(e) => setCustomEmployeeCount(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Módulos */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">
                Módulos Disponibles
              </h3>
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedModules.extraHours
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleModuleChange("extraHours")}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        selectedModules.extraHours
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedModules.extraHours && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold">
                          Módulo Gestión de Horas Extra
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Digitaliza completamente el proceso de gestión de horas
                        extra. Incluye registro, aprobación, cálculos
                        automáticos y reportes.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedModules.reports
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleModuleChange("reports")}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        selectedModules.reports
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedModules.reports && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold">
                          Módulo Reportes con IA
                        </h4>
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                          IA INCLUIDA
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Automatiza la consolidación y análisis de informes con
                        IA. Genera narrativas automáticas y facilita
                        aprobaciones.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            {/* Precios Base Transparentes */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">
                💰 Precios Base
              </h3>
              <div className="space-y-3 text-sm">
                {deploymentType === "saas" ? (
                  <div className="space-y-2">
                    <div className="font-medium text-blue-700">
                      SaaS Mensual:
                    </div>
                    <div>• PYME: $89-149/mes</div>
                    <div>• Mediana: $299-599/mes</div>
                    <div>• Grande: $799-1999/mes</div>
                    <div className="text-xs text-blue-600 mt-2">
                      *Precio final depende del número de empleados y módulos
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="font-medium text-blue-700">On-Premise:</div>
                    <div>• PYME: $8K + mant. 22%</div>
                    <div>• Mediana: $15K + mant. 23%</div>
                    <div>• Grande: $25K + mant. 25%</div>
                    <div className="text-xs text-blue-600 mt-2">
                      *Licencia perpetua + mantenimiento anual
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cotización */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
              <h3 className="text-2xl font-bold mb-4 text-green-800">
                📋 Cotización
              </h3>

              {Object.values(selectedModules).some(Boolean) ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">
                      {companySizes[companySize].label}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {customEmployeeCount
                        ? parseInt(customEmployeeCount)
                        : employeeCount}{" "}
                      empleados
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Módulos: {selectedModules.extraHours && "Horas Extra"}
                      {selectedModules.extraHours &&
                        selectedModules.reports &&
                        " + "}
                      {selectedModules.reports && "Reportes con IA"}
                    </div>

                    {deploymentType === "saas" ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Mensual:</span>
                          <span className="font-bold text-xl">
                            ${price.monthly}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-green-600">
                          <span>Anual (15% desc.):</span>
                          <span className="font-bold">${price.annual}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Setup único:</span>
                          <span>${price.setup}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total 3 años:</span>
                          <span className="text-green-700">
                            ${price.total3Years}
                          </span>
                        </div>

                        {/* Desglose de costos */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">
                            📊 Desglose de Costos
                          </h5>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Infraestructura/mes:</span>
                              <span>${price.infraCost}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Margen bruto:</span>
                              <span className="text-green-600">
                                {price.grossMargin}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              *Render + PostgreSQL + Vercel + desarrollo +
                              soporte
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Licencia:</span>
                          <span className="font-bold text-xl">
                            ${price.license}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Implementación:</span>
                          <span>${price.implementation}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Mantenimiento/año:</span>
                          <span>${price.maintenance}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total 3 años:</span>
                          <span className="text-green-700">
                            ${price.total3Years}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ROI Estimado */}
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <h4 className="font-semibold text-amber-800 mb-2">
                      🎯 ROI Estimado
                    </h4>
                    <div className="text-sm text-amber-700">
                      {deploymentType === "saas" ? (
                        <div>
                          <div>
                            • Ahorro: 15-20 hrs/semana de trabajo administrativo
                          </div>
                          <div>• ROI típico: 300-500% en el primer año</div>
                          <div>• Break-even: 2-4 meses</div>
                        </div>
                      ) : (
                        <div>
                          <div>• Control total de datos y procesos</div>
                          <div>• ROI: 200-400% en 18 meses</div>
                          <div>• Break-even: 6-12 meses</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Incluye */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      ✅ Incluye
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      {deploymentType === "saas" ? (
                        <div>
                          <div>• Hosting y mantenimiento</div>
                          <div>• Actualizaciones automáticas</div>
                          <div>• Soporte técnico</div>
                          <div>• Backups automáticos</div>
                          <div>• SSL y seguridad</div>
                        </div>
                      ) : (
                        <div>
                          <div>• Licencia perpetua</div>
                          <div>• Instalación Docker</div>
                          <div>• Capacitación inicial</div>
                          <div>• Soporte de implementación</div>
                          <div>• Documentación completa</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-gray-600">
                    Selecciona al menos un módulo para ver la cotización
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer con argumentos de venta */}
        <div className="bg-gray-50 p-6 border-t">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">🚀 ¿Por qué JEGASolutions?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Suite modular que crece con tu empresa</li>
                <li>• IA avanzada para análisis automático</li>
                <li>• Implementación en menos de 30 días</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">💡 Próximos Pasos</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Demo personalizada gratuita</li>
                <li>• Prueba piloto de 30 días</li>
                <li>• Capacitación incluida</li>
                <li>• Soporte durante implementación</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">
                🏗️ Infraestructura Incluida
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Hosting en Render + Vercel</li>
                <li>• Base de datos PostgreSQL dedicada</li>
                <li>• SSL/HTTPS automático</li>
                <li>• Backups diarios incluidos</li>
                <li>• Monitoreo 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JEGAPricingCalculator;
